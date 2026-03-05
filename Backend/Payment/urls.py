from django.urls import path

from .views import (
    WalletEsewaInitiateView,
    WalletEsewaVerifyView,
    StripeCheckoutInitiateView,
    StripeConnectOnboardView,
    StripeWebhookView,
    StripeWithdrawView,
    WalletTopUpInitiateView,
    WalletTopUpVerifyView,
    AdminWithdrawalListView,
    AdminWithdrawalApproveView,
    AdminWithdrawalRejectView,
)


urlpatterns = [
    path('topup/initiate/', WalletTopUpInitiateView.as_view(), name='wallet-topup-initiate'),
    path('topup/verify/', WalletTopUpVerifyView.as_view(), name='wallet-topup-verify'),
    path('esewa/initiate/', WalletEsewaInitiateView.as_view(), name='wallet-esewa-initiate'),
    path('esewa/verify/', WalletEsewaVerifyView.as_view(), name='wallet-esewa-verify'),
    path('stripe/checkout/', StripeCheckoutInitiateView.as_view(), name='stripe-checkout-initiate'),
    path('stripe/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('stripe/connect/', StripeConnectOnboardView.as_view(), name='stripe-connect'),
    path('stripe/withdraw/', StripeWithdrawView.as_view(), name='stripe-withdraw'),
    # Admin withdrawal management
    path('admin/withdrawals/', AdminWithdrawalListView.as_view(), name='admin-withdrawal-list'),
    path('admin/withdrawals/<int:pk>/approve/', AdminWithdrawalApproveView.as_view(), name='admin-withdrawal-approve'),
    path('admin/withdrawals/<int:pk>/reject/', AdminWithdrawalRejectView.as_view(), name='admin-withdrawal-reject'),
]
