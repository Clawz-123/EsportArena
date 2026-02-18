from django.urls import path

from .views import WalletTopUpInitiateView, WalletTopUpVerifyView


urlpatterns = [
    path('topup/initiate/', WalletTopUpInitiateView.as_view(), name='wallet-topup-initiate'),
    path('topup/verify/', WalletTopUpVerifyView.as_view(), name='wallet-topup-verify'),
]
