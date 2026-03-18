from decimal import Decimal, ROUND_HALF_UP

import requests
from django.conf import settings
from django.db import transaction as db_transaction
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
import stripe

from accounts.permission import IsSuperUser
from esport.response import api_response
from Notification.models import Notification
from Notification.services import send_notification_to_user
from Wallet.models import Wallet, WalletTransaction
from Wallet.serializers import WalletSerializer
from .models import PaymentOrder, WithdrawalRequest
from .serializers import (
	PaymentOrderSerializer,
	StripeTopUpInitiateSerializer,
	StripeTopUpVerifySerializer,
	StripeWithdrawSerializer,
	WithdrawalRequestSerializer,
	ManualWithdrawSerializer,
	WalletEsewaVerifySerializer,
	WalletTopUpInitiateSerializer,
	WalletTopUpVerifySerializer,
)


def _get_or_create_wallet(user):
	wallet, _ = Wallet.objects.get_or_create(user=user)
	return wallet


def _to_paisa(amount):
	return int(Decimal(amount) * 100)


def _stripe_coin_rate():
	rate = getattr(settings, 'STRIPE_COIN_RATE', 130)
	try:
		return int(rate)
	except (TypeError, ValueError):
		return 130


def _coins_to_usd(coins):
	rate = Decimal(_stripe_coin_rate())
	usd_amount = (Decimal(coins) / rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
	return usd_amount


def _usd_to_cents(amount):
	return int((Decimal(amount) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def _stripe_urls():
	success_url = getattr(settings, 'STRIPE_SUCCESS_URL', '')
	cancel_url = getattr(settings, 'STRIPE_CANCEL_URL', '')
	if not success_url or not cancel_url:
		if getattr(settings, 'DEBUG', False):
			success_url = success_url or 'http://localhost:5173/wallet/stripe-return'
			cancel_url = cancel_url or 'http://localhost:5173/wallet/stripe-return'
	return success_url, cancel_url


def _stripe_connect_urls():
	return_url = getattr(settings, 'STRIPE_CONNECT_RETURN_URL', '')
	refresh_url = getattr(settings, 'STRIPE_CONNECT_REFRESH_URL', '')
	if not return_url or not refresh_url:
		if getattr(settings, 'DEBUG', False):
			return_url = return_url or 'http://localhost:5173/PlayerWalletandEarning'
			refresh_url = refresh_url or 'http://localhost:5173/PlayerWalletandEarning'
	return return_url, refresh_url


# Creating a separate function for Khalti headers to avoid repetition and centralize the logic
def _khalti_headers():
	secret_key = getattr(settings, 'KHALTI_SECRET_KEY', '')
	return {
		'Authorization': f'Key {secret_key}',
		'Content-Type': 'application/json',
	}


def _esewa_urls():
	return (
		getattr(settings, 'ESEWA_FORM_URL', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'),
		getattr(settings, 'ESEWA_STATUS_URL', 'https://rc.esewa.com.np/api/epay/transaction/status/'),
		getattr(settings, 'ESEWA_SUCCESS_URL', ''),
		getattr(settings, 'ESEWA_FAILURE_URL', ''),
		getattr(settings, 'ESEWA_PRODUCT_CODE', ''),
		getattr(settings, 'ESEWA_SECRET_KEY', ''),
	)


def _esewa_signature(payload, signed_field_names, secret_key):
	import base64
	import hmac
	import hashlib

	parts = []
	for key in signed_field_names.split(','):
		value = payload.get(key, '')
		parts.append(f"{key}={value}")
	message = ','.join(parts)
	mac = hmac.new(secret_key.encode('utf-8'), message.encode('utf-8'), hashlib.sha256).digest()
	return base64.b64encode(mac).decode('utf-8')


def _send_payment_notification(user, title, message, metadata=None):
	send_notification_to_user(
		recipient=user,
		title=title,
		message=message,
		notification_type=Notification.NotificationTypes.PAYMENT,
		metadata=metadata or {},
	)


class WalletTopUpInitiateView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = WalletTopUpInitiateSerializer(data=request.data)
		if not serializer.is_valid():
			return api_response(
				is_success=False,
				error_message=serializer.errors,
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		amount = serializer.validated_data['amount']
		coins = int(amount)

		# Creating Payment Order
		order = PaymentOrder.objects.create(
			user=request.user,
			amount=amount,
			coins=coins,
		)

		# Preparing Khalti payment initiation payload
		return_url = getattr(settings, 'KHALTI_RETURN_URL', '')
		website_url = getattr(settings, 'KHALTI_WEBSITE_URL', '')
		base_url = getattr(settings, 'KHALTI_BASE_URL', 'https://khalti.com/api/v2')

		if not return_url or not website_url:
			if getattr(settings, 'DEBUG', False):
				return_url = 'http://localhost:5173/wallet/khalti-return'
				website_url = 'http://localhost:5173'
			else:
				order.status = PaymentOrder.Status.FAILED
				order.save(update_fields=['status', 'updated_at'])
				return api_response(
					is_success=False,
					error_message='Missing Khalti return or website URL configuration.',
					status_code=status.HTTP_400_BAD_REQUEST,
				)

		# Creating payload for Khalti payment initiation
		payload = {
			'return_url': return_url,
			'website_url': website_url,
			'amount': _to_paisa(amount),
			'purchase_order_id': str(order.id),
			'purchase_order_name': f'Wallet top-up {order.id}',
		}

		# Calling Khalti API to initiate payment
		try:
			response = requests.post(
				f'{base_url}/epayment/initiate/',
				json=payload,
				headers=_khalti_headers(),
				timeout=20,
			)
		except requests.RequestException:
			order.status = PaymentOrder.Status.FAILED
			order.save(update_fields=['status', 'updated_at'])
			return api_response(
				is_success=False,
				error_message='Failed to connect to payment gateway.',
				status_code=status.HTTP_502_BAD_GATEWAY,
			)

		# Chcking response from Khalti and updating order accordingly
		data = response.json() if response.content else {}
		if response.status_code != 200 or 'pidx' not in data:
			order.status = PaymentOrder.Status.FAILED
			order.save(update_fields=['status', 'updated_at'])
			return api_response(
				is_success=False,
				error_message=data or 'Failed to initiate payment.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		# Saving Khalti response details to order
		order.pidx = data.get('pidx')
		order.payment_url = data.get('payment_url')
		order.updated_at = timezone.now()
		order.save(update_fields=['pidx', 'payment_url', 'updated_at'])


		# Creating a pending wallet transaction for this top-up
		wallet = _get_or_create_wallet(request.user)
		WalletTransaction.objects.create(
			wallet=wallet,
			transaction_type=WalletTransaction.TransactionType.DEPOSIT,
			direction=WalletTransaction.Direction.CREDIT,
			amount=Decimal(coins),
			status=WalletTransaction.Status.PENDING,
			method=WalletTransaction.Method.KHALTI,
			reference=str(order.id),
			note='Top-up initiated',
		)

		# Retruning order details and payment URL to frontend
		return api_response(
			result={
				'order': PaymentOrderSerializer(order).data,
				'payment_url': order.payment_url,
			},
			status_code=status.HTTP_200_OK,
		)




class WalletTopUpVerifyView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = WalletTopUpVerifySerializer(data=request.data)
		if not serializer.is_valid():
			return api_response(
				is_success=False,
				error_message=serializer.errors,
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		# Finding the order based on pidx and user
		pidx = serializer.validated_data['pidx']
		try:
			order = PaymentOrder.objects.get(pidx=pidx, user=request.user)
		except PaymentOrder.DoesNotExist:
			return api_response(
				is_success=False,
				error_message='Payment order not found.',
				status_code=status.HTTP_404_NOT_FOUND,
			)

		base_url = getattr(settings, 'KHALTI_BASE_URL', 'https://khalti.com/api/v2')

		# Calling Khalti API to verify payment status
		try:
			response = requests.post(
				f'{base_url}/epayment/lookup/',
				json={'pidx': pidx},
				headers=_khalti_headers(),
				timeout=20,
			)
		except requests.RequestException:
			return api_response(
				is_success=False,
				error_message='Failed to verify payment with gateway.',
				status_code=status.HTTP_502_BAD_GATEWAY,
			)
		

		# Checking response from Khalti and updating order and wallet accordingly
		data = response.json() if response.content else {}
		payment_status = data.get('status')

		# Amount verification
		if response.status_code != 200 or payment_status != 'Completed':
			return api_response(
				is_success=False,
				error_message=data or 'Payment not completed.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)


		# Double-checking amount to prevent tampering
		expected_amount = _to_paisa(order.amount)
		paid_amount = data.get('total_amount')
		if paid_amount is not None and int(paid_amount) != expected_amount:
			return api_response(
				is_success=False,
				error_message='Amount mismatch during verification.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		if order.status == PaymentOrder.Status.PAID:
			wallet = _get_or_create_wallet(request.user)
			return api_response(
				result={
					'wallet': WalletSerializer(wallet).data,
					'order': PaymentOrderSerializer(order).data,
				},
				status_code=status.HTTP_200_OK,
			)


		# Updating order status to PAID and crediting user's wallet atomically
		wallet = _get_or_create_wallet(request.user)
		with db_transaction.atomic():
			order.status = PaymentOrder.Status.PAID
			order.updated_at = timezone.now()
			order.save(update_fields=['status', 'updated_at'])

			wallet.balance = wallet.balance + Decimal(order.coins)
			wallet.save(update_fields=['balance', 'updated_at'])

			WalletTransaction.objects.filter(
				wallet=wallet,
				reference=str(order.id),
				status=WalletTransaction.Status.PENDING,
			).update(
				status=WalletTransaction.Status.COMPLETED,
				note='Top-up completed',
			)

		_send_payment_notification(
			request.user,
			title='Wallet Top-up Successful',
			message=f'Your Khalti top-up of {order.coins} coins is completed.',
			metadata={
				'order_id': order.id,
				'provider': order.provider,
				'coins': order.coins,
			},
		)

		return api_response(
			result={
				'wallet': WalletSerializer(wallet).data,
				'order': PaymentOrderSerializer(order).data,
			},
			status_code=status.HTTP_200_OK,
		)


class WalletEsewaInitiateView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = WalletTopUpInitiateSerializer(data=request.data)
		if not serializer.is_valid():
			return api_response(
				is_success=False,
				error_message=serializer.errors,
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		amount = serializer.validated_data['amount']
		coins = int(amount)

		order = PaymentOrder.objects.create(
			user=request.user,
			amount=amount,
			coins=coins,
			provider=PaymentOrder.Provider.ESEWA,
		)

		form_url, status_url, success_url, failure_url, product_code, secret_key = _esewa_urls()

		if not success_url or not failure_url or not product_code or not secret_key:
			if getattr(settings, 'DEBUG', False):
				success_url = 'http://localhost:5173/wallet/esewa-return'
				failure_url = 'http://localhost:5173/wallet/esewa-return'
				product_code = product_code or 'EPAYTEST'
				secret_key = secret_key or '8gBm/:&EnhH.1/q'
			else:
				order.status = PaymentOrder.Status.FAILED
				order.save(update_fields=['status', 'updated_at'])
				return api_response(
					is_success=False,
					error_message='Missing eSewa configuration.',
					status_code=status.HTTP_400_BAD_REQUEST,
				)

		from uuid import uuid4
		transaction_uuid = f"{order.id}-{uuid4().hex[:8]}"
		payload = {
			'amount': str(amount),
			'tax_amount': '0',
			'total_amount': str(amount),
			'transaction_uuid': transaction_uuid,
			'product_code': product_code,
			'product_service_charge': '0',
			'product_delivery_charge': '0',
			'success_url': success_url,
			'failure_url': failure_url,
		}
		signed_field_names = 'total_amount,transaction_uuid,product_code'
		signature = _esewa_signature(payload, signed_field_names, secret_key)

		fields = {
			**payload,
			'signed_field_names': signed_field_names,
			'signature': signature,
		}

		order.pidx = transaction_uuid
		order.payment_url = form_url
		order.updated_at = timezone.now()
		order.save(update_fields=['pidx', 'payment_url', 'updated_at'])

		wallet = _get_or_create_wallet(request.user)
		WalletTransaction.objects.create(
			wallet=wallet,
			transaction_type=WalletTransaction.TransactionType.DEPOSIT,
			direction=WalletTransaction.Direction.CREDIT,
			amount=Decimal(coins),
			status=WalletTransaction.Status.PENDING,
			method=WalletTransaction.Method.ESEWA,
			reference=str(order.id),
			note='Top-up initiated',
		)

		return api_response(
			result={
				'order': PaymentOrderSerializer(order).data,
				'payment_url': form_url,
				'fields': fields,
			},
			status_code=status.HTTP_200_OK,
		)


class WalletEsewaVerifyView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = WalletEsewaVerifySerializer(data=request.data)
		if not serializer.is_valid():
			return api_response(
				is_success=False,
				error_message=serializer.errors,
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		transaction_uuid = serializer.validated_data['transaction_uuid']
		total_amount_raw = serializer.validated_data['total_amount']
		product_code = serializer.validated_data['product_code']
		signed_field_names = serializer.validated_data['signed_field_names']
		signature = serializer.validated_data['signature']
		try:
			total_amount = Decimal(total_amount_raw)
		except Exception:
			return api_response(
				is_success=False,
				error_message='Invalid total amount format.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		try:
			order = PaymentOrder.objects.get(pidx=transaction_uuid, user=request.user, provider=PaymentOrder.Provider.ESEWA)
		except PaymentOrder.DoesNotExist:
			return api_response(
				is_success=False,
				error_message='Payment order not found.',
				status_code=status.HTTP_404_NOT_FOUND,
			)

		if total_amount != order.amount:
			return api_response(
				is_success=False,
				error_message='Amount mismatch during verification.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		if order.status == PaymentOrder.Status.PAID:
			wallet = _get_or_create_wallet(request.user)
			return api_response(
				result={
					'wallet': WalletSerializer(wallet).data,
					'order': PaymentOrderSerializer(order).data,
				},
				status_code=status.HTTP_200_OK,
			)

		form_url, status_url, _, _, expected_product_code, secret_key = _esewa_urls()
		if getattr(settings, 'DEBUG', False):
			expected_product_code = expected_product_code or 'EPAYTEST'
			secret_key = secret_key or '8gBm/:&EnhH.1/q'
		if expected_product_code and product_code != expected_product_code:
			return api_response(
				is_success=False,
				error_message='Product code mismatch during verification.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		response_payload = {k: v for k, v in serializer.validated_data.items() if k != 'signature'}
		response_payload['total_amount'] = total_amount_raw
		response_signature = _esewa_signature(response_payload, signed_field_names, secret_key)
		if response_signature != signature:
			return api_response(
				is_success=False,
				error_message='Invalid response signature.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)
		try:
			response = requests.get(
				status_url,
				params={
					'product_code': product_code,
					'total_amount': str(total_amount),
					'transaction_uuid': transaction_uuid,
				},
				timeout=20,
			)
		except requests.RequestException:
			return api_response(
				is_success=False,
				error_message='Failed to verify payment with gateway.',
				status_code=status.HTTP_502_BAD_GATEWAY,
			)

		data = response.json() if response.content else {}
		payment_status = data.get('status')
		if response.status_code != 200 or payment_status != 'COMPLETE':
			return api_response(
				is_success=False,
				error_message='Payment not completed.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		wallet = _get_or_create_wallet(request.user)
		with db_transaction.atomic():
			order.status = PaymentOrder.Status.PAID
			order.updated_at = timezone.now()
			order.save(update_fields=['status', 'updated_at'])

			wallet.balance = wallet.balance + Decimal(order.coins)
			wallet.save(update_fields=['balance', 'updated_at'])

			WalletTransaction.objects.filter(
				wallet=wallet,
				reference=str(order.id),
				status=WalletTransaction.Status.PENDING,
			).update(
				status=WalletTransaction.Status.COMPLETED,
				note='Top-up completed',
			)

		_send_payment_notification(
			request.user,
			title='Wallet Top-up Successful',
			message=f'Your eSewa top-up of {order.coins} coins is completed.',
			metadata={
				'order_id': order.id,
				'provider': order.provider,
				'coins': order.coins,
			},
		)

		return api_response(
			result={
				'wallet': WalletSerializer(wallet).data,
				'order': PaymentOrderSerializer(order).data,
			},
			status_code=status.HTTP_200_OK,
		)


class StripeCheckoutInitiateView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		try:
			serializer = StripeTopUpInitiateSerializer(data=request.data)
			if not serializer.is_valid():
				return api_response(
					is_success=False,
					error_message=serializer.errors,
					status_code=status.HTTP_400_BAD_REQUEST,
				)

			coins = serializer.validated_data['coins']
			usd_amount = _coins_to_usd(coins)
			if usd_amount < Decimal('0.50'):
				return api_response(
					is_success=False,
					error_message='Amount is below Stripe minimum in USD.',
					status_code=status.HTTP_400_BAD_REQUEST,
				)

			currency = getattr(settings, 'STRIPE_CURRENCY', 'usd')
			stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
			if not stripe.api_key:
				return api_response(
					is_success=False,
					error_message='Stripe is not configured.',
					status_code=status.HTTP_400_BAD_REQUEST,
				)

			success_url, cancel_url = _stripe_urls()
			if not success_url or not cancel_url:
				return api_response(
					is_success=False,
					error_message='Missing Stripe return URLs.',
					status_code=status.HTTP_400_BAD_REQUEST,
				)

			order = PaymentOrder.objects.create(
				user=request.user,
				amount=usd_amount,
				coins=coins,
				provider=PaymentOrder.Provider.STRIPE,
			)

			amount_cents = _usd_to_cents(usd_amount)
			try:
				session = stripe.checkout.Session.create(
					mode='payment',
					client_reference_id=str(order.id),
					metadata={
						'order_id': str(order.id),
						'user_id': str(request.user.id),
						'coins': str(coins),
					},
					line_items=[
						{
							'price_data': {
								'currency': currency,
								'unit_amount': amount_cents,
								'product_data': {
									'name': f'Wallet top-up ({coins} coins)',
								},
							},
							'quantity': 1,
						}
					],
					success_url=f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}",
					cancel_url=cancel_url,
				)
			except stripe.error.StripeError as exc:
				order.status = PaymentOrder.Status.FAILED
				order.updated_at = timezone.now()
				order.save(update_fields=['status', 'updated_at'])
				return api_response(
					is_success=False,
					error_message=str(exc),
					status_code=status.HTTP_502_BAD_GATEWAY,
				)

			order.pidx = session.id
			order.payment_url = session.url
			order.stripe_session_id = session.id
			order.updated_at = timezone.now()
			order.save(update_fields=['pidx', 'payment_url', 'stripe_session_id', 'updated_at'])

			wallet = _get_or_create_wallet(request.user)
			WalletTransaction.objects.create(
				wallet=wallet,
				transaction_type=WalletTransaction.TransactionType.DEPOSIT,
				direction=WalletTransaction.Direction.CREDIT,
				amount=Decimal(coins),
				status=WalletTransaction.Status.PENDING,
				method=WalletTransaction.Method.STRIPE,
				reference=str(order.id),
				note='Top-up initiated',
			)

			return api_response(
				result={
					'order': PaymentOrderSerializer(order).data,
					'checkout_url': session.url,
				},
				status_code=status.HTTP_200_OK,
			)
		except Exception as exc:
			return api_response(
				is_success=False,
				error_message=str(exc),
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)


class StripeTopUpVerifyView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = StripeTopUpVerifySerializer(data=request.data)
		if not serializer.is_valid():
			return api_response(
				is_success=False,
				error_message=serializer.errors,
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		session_id = serializer.validated_data['session_id']
		stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
		if not stripe.api_key:
			return api_response(
				is_success=False,
				error_message='Stripe is not configured.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		try:
			order = PaymentOrder.objects.get(
				provider=PaymentOrder.Provider.STRIPE,
				stripe_session_id=session_id,
				user=request.user,
			)
		except PaymentOrder.DoesNotExist:
			return api_response(
				is_success=False,
				error_message='Stripe top-up session not found.',
				status_code=status.HTTP_404_NOT_FOUND,
			)

		wallet = _get_or_create_wallet(request.user)
		if order.status == PaymentOrder.Status.PAID:
			return api_response(
				result={
					'wallet': WalletSerializer(wallet).data,
					'order': PaymentOrderSerializer(order).data,
				},
				status_code=status.HTTP_200_OK,
			)

		try:
			session = stripe.checkout.Session.retrieve(session_id)
		except stripe.error.StripeError as exc:
			return api_response(
				is_success=False,
				error_message=str(exc),
				status_code=status.HTTP_502_BAD_GATEWAY,
			)

		if session.get('payment_status') != 'paid':
			return api_response(
				is_success=False,
				error_message='Stripe payment is still pending. Please wait a few seconds and try again.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		with db_transaction.atomic():
			order.status = PaymentOrder.Status.PAID
			order.updated_at = timezone.now()
			order.save(update_fields=['status', 'updated_at'])

			wallet.balance = wallet.balance + Decimal(order.coins)
			wallet.save(update_fields=['balance', 'updated_at'])

			WalletTransaction.objects.filter(
				wallet=wallet,
				reference=str(order.id),
				status=WalletTransaction.Status.PENDING,
			).update(
				status=WalletTransaction.Status.COMPLETED,
				note='Top-up completed',
			)

		_send_payment_notification(
			request.user,
			title='Wallet Top-up Successful',
			message=f'Your Stripe top-up of {order.coins} coins is completed.',
			metadata={
				'order_id': order.id,
				'provider': order.provider,
				'coins': order.coins,
			},
		)

		return api_response(
			result={
				'wallet': WalletSerializer(wallet).data,
				'order': PaymentOrderSerializer(order).data,
			},
			status_code=status.HTTP_200_OK,
		)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
	authentication_classes = []
	permission_classes = []

	def post(self, request):
		stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
		webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
		payload = request.body
		signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')

		try:
			event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
		except (ValueError, stripe.error.SignatureVerificationError) as exc:
			return api_response(
				is_success=False,
				error_message=str(exc),
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		event_type = event.get('type')
		data_object = event.get('data', {}).get('object', {})

		if event_type == 'checkout.session.completed':
			order_id = data_object.get('metadata', {}).get('order_id')
			if not order_id:
				return api_response(status_code=status.HTTP_200_OK)
			try:
				order = PaymentOrder.objects.get(id=order_id, provider=PaymentOrder.Provider.STRIPE)
			except PaymentOrder.DoesNotExist:
				return api_response(status_code=status.HTTP_200_OK)
			if order.status == PaymentOrder.Status.PAID:
				return api_response(status_code=status.HTTP_200_OK)

			wallet = _get_or_create_wallet(order.user)
			with db_transaction.atomic():
				order.status = PaymentOrder.Status.PAID
				order.updated_at = timezone.now()
				order.save(update_fields=['status', 'updated_at'])

				wallet.balance = wallet.balance + Decimal(order.coins)
				wallet.save(update_fields=['balance', 'updated_at'])

				WalletTransaction.objects.filter(
					wallet=wallet,
					reference=str(order.id),
					status=WalletTransaction.Status.PENDING,
				).update(
					status=WalletTransaction.Status.COMPLETED,
					note='Top-up completed',
				)

			_send_payment_notification(
				order.user,
				title='Wallet Top-up Successful',
				message=f'Your Stripe top-up of {order.coins} coins is completed.',
				metadata={
					'order_id': order.id,
					'provider': order.provider,
					'coins': order.coins,
				},
			)

			return api_response(status_code=status.HTTP_200_OK)

		if event_type in ['payout.paid', 'payout.failed']:
			withdrawal_id = data_object.get('metadata', {}).get('withdrawal_id')
			if not withdrawal_id:
				return api_response(status_code=status.HTTP_200_OK)
			try:
				withdrawal = WithdrawalRequest.objects.get(id=withdrawal_id)
			except WithdrawalRequest.DoesNotExist:
				return api_response(status_code=status.HTTP_200_OK)

			wallet = _get_or_create_wallet(withdrawal.user)
			if event_type == 'payout.paid':
				if withdrawal.status != WithdrawalRequest.Status.COMPLETED:
					withdrawal.status = WithdrawalRequest.Status.COMPLETED
					withdrawal.updated_at = timezone.now()
					withdrawal.save(update_fields=['status', 'updated_at'])

					WalletTransaction.objects.filter(
						wallet=wallet,
						reference=str(withdrawal.id),
						transaction_type=WalletTransaction.TransactionType.WITHDRAWAL,
						status=WalletTransaction.Status.PENDING,
					).update(
						status=WalletTransaction.Status.COMPLETED,
						note='Withdrawal completed',
					)

					_send_payment_notification(
						withdrawal.user,
						title='Withdrawal Completed',
						message=f'Your {withdrawal.provider} withdrawal of {withdrawal.coins} coins is completed.',
						metadata={
							'withdrawal_id': withdrawal.id,
							'provider': withdrawal.provider,
							'coins': withdrawal.coins,
						},
					)
				return api_response(status_code=status.HTTP_200_OK)

			if event_type == 'payout.failed':
				if withdrawal.status != WithdrawalRequest.Status.FAILED:
					with db_transaction.atomic():
						withdrawal.status = WithdrawalRequest.Status.FAILED
						withdrawal.updated_at = timezone.now()
						withdrawal.save(update_fields=['status', 'updated_at'])

						wallet.balance = wallet.balance + Decimal(withdrawal.coins)
						wallet.save(update_fields=['balance', 'updated_at'])

						WalletTransaction.objects.filter(
							wallet=wallet,
							reference=str(withdrawal.id),
							transaction_type=WalletTransaction.TransactionType.WITHDRAWAL,
							status=WalletTransaction.Status.PENDING,
						).update(
							status=WalletTransaction.Status.FAILED,
							note='Withdrawal failed',
						)

					_send_payment_notification(
						withdrawal.user,
						title='Withdrawal Failed',
						message=f'Your {withdrawal.provider} withdrawal of {withdrawal.coins} coins failed and has been refunded.',
						metadata={
							'withdrawal_id': withdrawal.id,
							'provider': withdrawal.provider,
							'coins': withdrawal.coins,
						},
					)
				return api_response(status_code=status.HTTP_200_OK)

		return api_response(status_code=status.HTTP_200_OK)


class StripeConnectOnboardView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
		if not stripe.api_key:
			return api_response(
				is_success=False,
				error_message='Stripe is not configured.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		return_url, refresh_url = _stripe_connect_urls()
		if not return_url or not refresh_url:
			return api_response(
				is_success=False,
				error_message='Missing Stripe Connect URLs.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		user = request.user
		account_id = user.stripe_account_id
		try:
			if not account_id:
				account = stripe.Account.create(
					type='express',
					email=user.email,
				)
				account_id = account.id
				user.stripe_account_id = account_id
				user.stripe_account_completed = False
				user.save(update_fields=['stripe_account_id', 'stripe_account_completed'])
			else:
				account = stripe.Account.retrieve(account_id)
				user.stripe_account_completed = bool(
					account.get('details_submitted') and account.get('payouts_enabled')
				)
				user.save(update_fields=['stripe_account_completed'])

			account_link = stripe.AccountLink.create(
				account=account_id,
				type='account_onboarding',
				refresh_url=refresh_url,
				return_url=return_url,
			)
		except stripe.error.StripeError as exc:
			return api_response(
				is_success=False,
				error_message=str(exc),
				status_code=status.HTTP_502_BAD_GATEWAY,
			)

		return api_response(
			result={
				'url': account_link.url,
				'account_id': account_id,
			},
			status_code=status.HTTP_200_OK,
		)


class StripeWithdrawView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = StripeWithdrawSerializer(data=request.data)
		if not serializer.is_valid():
			return api_response(
				is_success=False,
				error_message=serializer.errors,
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		coins = serializer.validated_data['coins']
		usd_amount = _coins_to_usd(coins)
		if usd_amount < Decimal('0.50'):
			return api_response(
				is_success=False,
				error_message='Amount is below Stripe minimum in USD.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		user = request.user
		if not user.stripe_account_id:
			return api_response(
				is_success=False,
				error_message='Stripe account not connected.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
		if not stripe.api_key:
			return api_response(
				is_success=False,
				error_message='Stripe is not configured.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		try:
			account = stripe.Account.retrieve(user.stripe_account_id)
		except stripe.error.StripeError as exc:
			return api_response(
				is_success=False,
				error_message=str(exc),
				status_code=status.HTTP_502_BAD_GATEWAY,
			)

		# Keep local status in sync with actual Stripe account readiness.
		stripe_ready = bool(account.get('details_submitted') and account.get('payouts_enabled'))
		if user.stripe_account_completed != stripe_ready:
			user.stripe_account_completed = stripe_ready
			user.save(update_fields=['stripe_account_completed'])

		if not account.get('details_submitted'):
			return api_response(
				is_success=False,
				error_message='Stripe onboarding is incomplete. Please complete Stripe Connect onboarding.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		if not account.get('payouts_enabled'):
			return api_response(
				is_success=False,
				error_message='Stripe payouts are not enabled for this account yet. Please resolve pending Stripe verification requirements.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		wallet = _get_or_create_wallet(user)
		if wallet.balance < Decimal(coins):
			return api_response(
				is_success=False,
				error_message='Insufficient wallet balance.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		amount_cents = _usd_to_cents(usd_amount)
		currency = getattr(settings, 'STRIPE_CURRENCY', 'usd')

		# Apply platform fee
		fee_percent = Decimal(getattr(settings, 'WITHDRAWAL_FEE_PERCENT', 5))
		platform_fee = (usd_amount * fee_percent / Decimal(100)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
		net_usd = usd_amount - platform_fee
		net_cents = _usd_to_cents(net_usd)

		with db_transaction.atomic():
			wallet.balance = wallet.balance - Decimal(coins)
			wallet.save(update_fields=['balance', 'updated_at'])

			withdrawal = WithdrawalRequest.objects.create(
				user=user,
				provider=WithdrawalRequest.Provider.STRIPE,
				amount=net_usd,
				platform_fee=platform_fee,
				coins=coins,
				stripe_account_id=user.stripe_account_id,
			)

			WalletTransaction.objects.create(
				wallet=wallet,
				transaction_type=WalletTransaction.TransactionType.WITHDRAWAL,
				direction=WalletTransaction.Direction.DEBIT,
				amount=Decimal(coins),
				status=WalletTransaction.Status.PENDING,
				method=WalletTransaction.Method.STRIPE,
				reference=str(withdrawal.id),
				note='Withdrawal requested',
			)

		_send_payment_notification(
			user,
			title='Withdrawal Requested',
			message=f'Your Stripe withdrawal request for {coins} coins has been submitted for review.',
			metadata={
				'withdrawal_id': withdrawal.id,
				'provider': WithdrawalRequest.Provider.STRIPE,
				'coins': coins,
			},
		)

		try:
			transfer = stripe.Transfer.create(
				amount=net_cents,
				currency=currency,
				destination=user.stripe_account_id,
				metadata={'withdrawal_id': str(withdrawal.id)},
			)
		except stripe.error.StripeError as exc:
			with db_transaction.atomic():
				withdrawal.status = WithdrawalRequest.Status.FAILED
				withdrawal.updated_at = timezone.now()
				withdrawal.save(update_fields=['status', 'updated_at'])

				wallet.balance = wallet.balance + Decimal(coins)
				wallet.save(update_fields=['balance', 'updated_at'])

				WalletTransaction.objects.filter(
					wallet=wallet,
					reference=str(withdrawal.id),
					transaction_type=WalletTransaction.TransactionType.WITHDRAWAL,
					status=WalletTransaction.Status.PENDING,
				).update(
					status=WalletTransaction.Status.FAILED,
					note='Withdrawal failed',
				)

			_send_payment_notification(
				user,
				title='Withdrawal Failed',
				message=f'Your Stripe withdrawal of {coins} coins failed and has been refunded.',
				metadata={
					'withdrawal_id': withdrawal.id,
					'provider': WithdrawalRequest.Provider.STRIPE,
					'coins': coins,
				},
			)

			return api_response(
				is_success=False,
				error_message=str(exc),
				status_code=status.HTTP_502_BAD_GATEWAY,
			)

		withdrawal.stripe_transfer_id = transfer.id
		withdrawal.status = WithdrawalRequest.Status.COMPLETED
		withdrawal.updated_at = timezone.now()
		withdrawal.save(update_fields=['stripe_transfer_id', 'status', 'updated_at'])

		WalletTransaction.objects.filter(
			wallet=wallet,
			reference=str(withdrawal.id),
			transaction_type=WalletTransaction.TransactionType.WITHDRAWAL,
			status=WalletTransaction.Status.PENDING,
		).update(status=WalletTransaction.Status.COMPLETED, note='Withdrawal completed via Stripe')

		_send_payment_notification(
			user,
			title='Withdrawal Completed',
			message=f'Your Stripe withdrawal of {coins} coins is completed.',
			metadata={
				'withdrawal_id': withdrawal.id,
				'provider': WithdrawalRequest.Provider.STRIPE,
				'coins': coins,
			},
		)

		return api_response(
			result={'withdrawal': WithdrawalRequestSerializer(withdrawal).data},
			status_code=status.HTTP_200_OK,
		)


# ───────── Manual (eSewa / Khalti) Withdrawal ─────────

class ManualWithdrawView(APIView):
	"""Request a withdrawal via eSewa or Khalti (pending admin approval)."""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		serializer = ManualWithdrawSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		coins = serializer.validated_data['coins']
		provider = serializer.validated_data['provider']
		account_identifier = serializer.validated_data['account_identifier']

		wallet = _get_or_create_wallet(request.user)
		if wallet.balance < Decimal(coins):
			return api_response(
				is_success=False,
				error_message='Insufficient wallet balance.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		fee_percent = Decimal(getattr(settings, 'WITHDRAWAL_FEE_PERCENT', 5))
		platform_fee = (Decimal(coins) * fee_percent / Decimal(100)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
		net_amount = Decimal(coins) - platform_fee  # amount user actually receives

		withdrawal = WithdrawalRequest.objects.create(
			user=request.user,
			provider=provider,
			account_identifier=account_identifier,
			amount=net_amount,
			platform_fee=platform_fee,
			coins=coins,
		)

		_send_payment_notification(
			request.user,
			title='Withdrawal Requested',
			message=f'Your {provider} withdrawal request for {coins} coins has been submitted for review.',
			metadata={
				'withdrawal_id': withdrawal.id,
				'provider': provider,
				'coins': coins,
			},
		)

		return api_response(
			result={'withdrawal': WithdrawalRequestSerializer(withdrawal).data},
			status_code=status.HTTP_201_CREATED,
		)


class UserWithdrawalListView(APIView):
	"""List the logged-in user's withdrawal requests."""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		withdrawals = WithdrawalRequest.objects.filter(user=request.user).order_by('-created_at')
		data = WithdrawalRequestSerializer(withdrawals, many=True, context={'request': request}).data
		return api_response(
			result={'withdrawals': data},
			status_code=status.HTTP_200_OK,
		)


# ───────── Admin Withdrawal Management ─────────

class AdminWithdrawalListView(APIView):
	"""List all withdrawal requests (admin only)."""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsSuperUser]

	def get(self, request):
		try:
			withdrawals = WithdrawalRequest.objects.select_related('user').order_by('-created_at')
			data = []
			for w in withdrawals:
				data.append({
					'id': w.id,
					'user': w.user.id,
					'user_email': w.user.email,
					'user_name': w.user.name or '',
					'provider': w.provider or '',
					'account_identifier': w.account_identifier or '',
					'coins': w.coins,
					'amount': str(w.amount),
					'platform_fee': str(w.platform_fee),
					'status': w.status,
					'stripe_account_id': w.stripe_account_id or '',
					'receipt_image': request.build_absolute_uri(w.receipt_image.url) if w.receipt_image else None,
					'created_at': w.created_at.isoformat(),
					'updated_at': w.updated_at.isoformat(),
				})
			return api_response(
				is_success=True,
				status_code=status.HTTP_200_OK,
				result={'withdrawals': data},
			)
		except Exception as e:
			return api_response(
				is_success=False,
				error_message=str(e),
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)


class AdminWithdrawalApproveView(APIView):
	"""Approve a pending withdrawal request (admin only)."""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsSuperUser]

	def post(self, request, pk):
		try:
			withdrawal = WithdrawalRequest.objects.select_related('user').get(pk=pk)
		except WithdrawalRequest.DoesNotExist:
			return api_response(
				is_success=False,
				error_message='Withdrawal request not found.',
				status_code=status.HTTP_404_NOT_FOUND,
			)

		if withdrawal.status != WithdrawalRequest.Status.PENDING:
			return api_response(
				is_success=False,
				error_message=f'Cannot approve a {withdrawal.status} withdrawal.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		receipt = request.FILES.get('receipt_image')

		with db_transaction.atomic():
			# Deduct coins from wallet now that admin has approved
			wallet = _get_or_create_wallet(withdrawal.user)
			if wallet.balance < Decimal(withdrawal.coins):
				return api_response(
					is_success=False,
					error_message='User has insufficient balance to fulfil this withdrawal.',
					status_code=status.HTTP_400_BAD_REQUEST,
				)

			wallet.balance = wallet.balance - Decimal(withdrawal.coins)
			wallet.save(update_fields=['balance', 'updated_at'])

			withdrawal.status = WithdrawalRequest.Status.COMPLETED
			withdrawal.updated_at = timezone.now()
			update_fields = ['status', 'updated_at']
			if receipt:
				withdrawal.receipt_image = receipt
				update_fields.append('receipt_image')
			withdrawal.save(update_fields=update_fields)

			# Create the wallet transaction as completed
			method_map = {'esewa': WalletTransaction.Method.ESEWA, 'khalti': WalletTransaction.Method.KHALTI}
			method = method_map.get(withdrawal.provider, WalletTransaction.Method.STRIPE)

			WalletTransaction.objects.create(
				wallet=wallet,
				transaction_type=WalletTransaction.TransactionType.WITHDRAWAL,
				direction=WalletTransaction.Direction.DEBIT,
				amount=Decimal(withdrawal.coins),
				status=WalletTransaction.Status.COMPLETED,
				method=method,
				reference=str(withdrawal.id),
				note=f'Withdrawal via {withdrawal.provider} to {withdrawal.account_identifier}',
			)

		_send_payment_notification(
			withdrawal.user,
			title='Withdrawal Approved',
			message=f'Your {withdrawal.provider} withdrawal of {withdrawal.coins} coins was approved.',
			metadata={
				'withdrawal_id': withdrawal.id,
				'provider': withdrawal.provider,
				'coins': withdrawal.coins,
			},
		)

		return api_response(
			is_success=True,
			status_code=status.HTTP_200_OK,
			result={'message': 'Withdrawal approved successfully.'},
		)


class AdminWithdrawalRejectView(APIView):
	"""Reject a pending withdrawal request and refund coins (admin only)."""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsSuperUser]

	def post(self, request, pk):
		try:
			withdrawal = WithdrawalRequest.objects.select_related('user').get(pk=pk)
		except WithdrawalRequest.DoesNotExist:
			return api_response(
				is_success=False,
				error_message='Withdrawal request not found.',
				status_code=status.HTTP_404_NOT_FOUND,
			)

		if withdrawal.status != WithdrawalRequest.Status.PENDING:
			return api_response(
				is_success=False,
				error_message=f'Cannot reject a {withdrawal.status} withdrawal.',
				status_code=status.HTTP_400_BAD_REQUEST,
			)

		with db_transaction.atomic():
			withdrawal.status = WithdrawalRequest.Status.FAILED
			withdrawal.updated_at = timezone.now()
			withdrawal.save(update_fields=['status', 'updated_at'])

		_send_payment_notification(
			withdrawal.user,
			title='Withdrawal Rejected',
			message=f'Your {withdrawal.provider} withdrawal of {withdrawal.coins} coins was rejected.',
			metadata={
				'withdrawal_id': withdrawal.id,
				'provider': withdrawal.provider,
				'coins': withdrawal.coins,
			},
		)

		return api_response(
			is_success=True,
			status_code=status.HTTP_200_OK,
			result={'message': 'Withdrawal rejected.'},
		)
