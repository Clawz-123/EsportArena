from decimal import Decimal

from rest_framework import serializers
from esport.media_utils import resolve_media_url

from .models import PaymentOrder, WithdrawalRequest


class PaymentOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentOrder
        fields = [
            'id','provider','amount','coins','status','pidx','payment_url','stripe_session_id','created_at',]
        read_only_fields = fields


class WalletTopUpInitiateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('10'),
        max_value=Decimal('5000'),
    )

    def validate(self, attrs):
        amount = attrs.get('amount')

        if amount is None:
            return attrs

        if amount <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')

        if amount < Decimal('10'):
            raise serializers.ValidationError('Minimum top-up amount is 10 coins.')

        if amount > Decimal('5000'):
            raise serializers.ValidationError('Maximum top-up amount is 5000 coins.')

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
    coins = serializers.IntegerField(min_value=10, max_value=5000)

    def validate(self, attrs):
        coins = attrs.get('coins')
        if coins is None:
            raise serializers.ValidationError('Coins amount is required.')
        if coins < 10:
            raise serializers.ValidationError('Minimum top-up amount is 10 coins.')
        if coins > 5000:
            raise serializers.ValidationError('Maximum top-up amount is 5000 coins.')
        return attrs


class StripeTopUpVerifySerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=120)


class StripeWithdrawSerializer(serializers.Serializer):
    coins = serializers.IntegerField(min_value=10, max_value=5000)

    def validate(self, attrs):
        coins = attrs.get('coins')
        if coins is None or coins <= 0:
            raise serializers.ValidationError('Coins must be greater than zero.')
        if coins < 10:
            raise serializers.ValidationError('Minimum withdrawal amount is 10 coins.')
        if coins > 5000:
            raise serializers.ValidationError('Maximum withdrawal amount is 5000 coins.')
        return attrs


class WithdrawalRequestSerializer(serializers.ModelSerializer):
    receipt_image = serializers.SerializerMethodField()

    class Meta:
        model = WithdrawalRequest
        fields = [
            'id', 'provider', 'account_identifier', 'amount', 'platform_fee', 'coins', 'status', 'stripe_account_id', 'stripe_transfer_id', 'stripe_payout_id', 'receipt_image', 'created_at', 'updated_at',]
        read_only_fields = fields

    def get_receipt_image(self, obj):
        if obj.receipt_image:
            request = self.context.get('request')
            return resolve_media_url(request, obj.receipt_image)
        return None


class ManualWithdrawSerializer(serializers.Serializer):
    coins = serializers.IntegerField(min_value=10, max_value=5000)
    provider = serializers.ChoiceField(choices=['esewa', 'khalti'])
    account_identifier = serializers.CharField(max_length=120)

    def validate_coins(self, value):
        if value <= 0:
            raise serializers.ValidationError('Coins must be greater than zero.')
        if value < 10:
            raise serializers.ValidationError('Minimum withdrawal amount is 10 coins.')
        if value > 5000:
            raise serializers.ValidationError('Maximum withdrawal amount is 5000 coins.')
        return value

    def validate_account_identifier(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError('Account identifier is required.')
        return cleaned
