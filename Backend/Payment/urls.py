from django.urls import path

from .views import (
    WalletEsewaInitiateView,
    WalletEsewaVerifyView,
    WalletTopUpInitiateView,
    WalletTopUpVerifyView,
)


urlpatterns = [
    path('topup/initiate/', WalletTopUpInitiateView.as_view(), name='wallet-topup-initiate'),
    path('topup/verify/', WalletTopUpVerifyView.as_view(), name='wallet-topup-verify'),
    path('esewa/initiate/', WalletEsewaInitiateView.as_view(), name='wallet-esewa-initiate'),
    path('esewa/verify/', WalletEsewaVerifyView.as_view(), name='wallet-esewa-verify'),
]
