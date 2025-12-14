from rest_framework import serializers
from .models import User, Player, Organizer


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    # accept full_name from frontend and split if provided
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'full_name', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def validate_first_name(self, value):
        if value is not None and value != "" and len(value) < 2:
            raise serializers.ValidationError("First_name must be at least 2 characters long.")
        return value

    def validate_last_name(self, value):
        if value is not None and value != "" and len(value) < 2:
            raise serializers.ValidationError("Last_name must be at least 2 characters long.")
        return value

    def create(self, validated_data):
        # handle optional full_name
        full_name = validated_data.pop('full_name', None)
        if full_name and (not validated_data.get('first_name') and not validated_data.get('last_name')):
            parts = full_name.strip().split(None, 1)
            validated_data['first_name'] = parts[0]
            validated_data['last_name'] = parts[1] if len(parts) > 1 else ''

        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Incorrect password."})

        attrs['user'] = user
        return attrs


class PlayerSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)

    class Meta:
        model = Player
        fields = ['id', 'user', 'display_name', 'phone', 'is_verified', 'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']


class OrganizerSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)

    class Meta:
        model = Organizer
        fields = ['id', 'user', 'organization_name', 'phone', 'website', 'created_at']
        read_only_fields = ['id', 'created_at']


class PlayerCreateSerializer(serializers.Serializer):
    # user fields
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)

    # player fields
    display_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def create(self, validated_data):
        # extract user data
        full_name = validated_data.pop('full_name', None)
        first_name = validated_data.pop('first_name', '') or ''
        last_name = validated_data.pop('last_name', '') or ''

        if full_name and not (first_name or last_name):
            parts = full_name.strip().split(None, 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''

        password = validated_data.pop('password')
        email = validated_data.pop('email')

        user = User(email=email, first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save()

        player = Player.objects.create(user=user, display_name=validated_data.get('display_name', ''), phone=validated_data.get('phone', ''))
        return player


class OrganizerCreateSerializer(serializers.Serializer):
    # user fields
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, allow_blank=True)

    # organizer fields
    organization_name = serializers.CharField(required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', None)
        first_name = validated_data.pop('first_name', '') or ''
        last_name = validated_data.pop('last_name', '') or ''

        if full_name and not (first_name or last_name):
            parts = full_name.strip().split(None, 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''

        password = validated_data.pop('password')
        email = validated_data.pop('email')

        user = User(email=email, first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save()

        organizer = Organizer.objects.create(
            user=user,
            organization_name=validated_data.get('organization_name'),
            phone=validated_data.get('phone', ''),
            website=validated_data.get('website', '')
        )
        return organizer