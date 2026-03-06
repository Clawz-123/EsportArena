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
		data['stripe_connected'] = bool(getattr(request.user, 'stripe_account_completed', False))
		return api_response(result=data, status_code=status.HTTP_200_OK)


class WalletTransactionListView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		wallet = _get_or_create_wallet(request.user)
		transactions = wallet.transactions.all()
		serializer = WalletTransactionSerializer(transactions, many=True)
		return api_response(result=serializer.data, status_code=status.HTTP_200_OK)
