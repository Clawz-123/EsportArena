from django.urls import path

from .views import WalletDetailView, WalletTransactionListView


urlpatterns = [
    path('balance/', WalletDetailView.as_view(), name='wallet-balance'),
    path('transactions/', WalletTransactionListView.as_view(), name='wallet-transactions'),
]
