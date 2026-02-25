from decimal import Decimal

import requests
from django.conf import settings
from django.db import transaction as db_transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from esport.response import api_response
from Wallet.models import Wallet, WalletTransaction
from Wallet.serializers import WalletSerializer
from .models import PaymentOrder
from .serializers import (
	PaymentOrderSerializer,
	WalletTopUpInitiateSerializer,
	WalletTopUpVerifySerializer,
)


def _get_or_create_wallet(user):
	wallet, _ = Wallet.objects.get_or_create(user=user)
	return wallet


def _to_paisa(amount):
	return int(Decimal(amount) * 100)


# Creating a separate function for Khalti headers to avoid repetition and centralize the logic
def _khalti_headers():
	secret_key = getattr(settings, 'KHALTI_SECRET_KEY', '')
	return {
		'Authorization': f'Key {secret_key}',
		'Content-Type': 'application/json',
	}


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

		return api_response(
			result={
				'wallet': WalletSerializer(wallet).data,
				'order': PaymentOrderSerializer(order).data,
			},
			status_code=status.HTTP_200_OK,
		)
