import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from esport.response import api_response
from .models import Wallet
from .serializers import WalletSerializer, WalletTransactionSerializer


def _get_or_create_wallet(user):
	wallet, _ = Wallet.objects.get_or_create(user=user)
	return wallet


class WalletDetailView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		wallet = _get_or_create_wallet(request.user)
		serializer = WalletSerializer(wallet)
		data = serializer.data

		user = request.user
		stripe_connected = bool(getattr(user, 'stripe_account_completed', False))
		if user.stripe_account_id:
			stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
			if stripe.api_key:
				try:
					account = stripe.Account.retrieve(user.stripe_account_id)
					stripe_connected = bool(account.get('details_submitted') and account.get('payouts_enabled'))
					if user.stripe_account_completed != stripe_connected:
						user.stripe_account_completed = stripe_connected
						user.save(update_fields=['stripe_account_completed'])
				except stripe.error.StripeError:
					# Keep last known state on Stripe API errors.
					pass

		data['stripe_connected'] = stripe_connected
		return api_response(result=data, status_code=status.HTTP_200_OK)


class WalletTransactionListView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		wallet = _get_or_create_wallet(request.user)
		transactions = wallet.transactions.all()
		serializer = WalletTransactionSerializer(transactions, many=True)
		return api_response(result=serializer.data, status_code=status.HTTP_200_OK)
