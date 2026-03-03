from rest_framework import serializers

from .models import PaymentOrder, WithdrawalRequest


class PaymentOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentOrder
        fields = [
            'id','provider','amount','coins','status','pidx','payment_url','stripe_session_id','created_at',]
        read_only_fields = fields


class WalletTopUpInitiateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=10.00)

    def validate(self, attrs):
        amount = attrs.get('amount')

        if amount is None:
            return attrs

        if amount <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')

        if amount != amount.to_integral_value():
            raise serializers.ValidationError('Amount must be a whole number for coin conversion.')

        return attrs


class WalletTopUpVerifySerializer(serializers.Serializer):
    pidx = serializers.CharField(max_length=100)


class WalletEsewaVerifySerializer(serializers.Serializer):
    transaction_uuid = serializers.CharField(max_length=100)
    total_amount = serializers.CharField(max_length=20)
    product_code = serializers.CharField(max_length=50)
    status = serializers.CharField(max_length=20, required=False, allow_blank=True)
    transaction_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    signed_field_names = serializers.CharField(max_length=200)
    signature = serializers.CharField(max_length=200)


class StripeTopUpInitiateSerializer(serializers.Serializer):
    coins = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        coins = attrs.get('coins')
        if coins is None or coins <= 0:
            raise serializers.ValidationError('Coins must be greater than zero.')
        return attrs


class StripeWithdrawSerializer(serializers.Serializer):
    coins = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        coins = attrs.get('coins')
        if coins is None or coins <= 0:
            raise serializers.ValidationError('Coins must be greater than zero.')
        return attrs


class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = [
            'id',
            'amount',
            'coins',
            'status',
            'stripe_account_id',
            'stripe_transfer_id',
            'stripe_payout_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields
