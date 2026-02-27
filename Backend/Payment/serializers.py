from rest_framework import serializers

from .models import PaymentOrder


class PaymentOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentOrder
        fields = [
            'id','provider','amount','coins','status','pidx','payment_url','created_at',]
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
