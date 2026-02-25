from rest_framework import serializers

from .models import Wallet, WalletTransaction


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'user', 'balance', 'updated_at']
        read_only_fields = ['id', 'user', 'balance', 'updated_at']


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id','transaction_type','direction','amount','status', 'method','reference','note','created_at', ]
        read_only_fields = fields