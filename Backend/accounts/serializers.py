from rest_framework import serializers
from .models import User

# Serializer for User model
class UserResponseSerializers(serializers.ModelSerializer):
    class Meta:
        # Specify the model and fields to be serialized
        model = User
        fields = ['id', 'email', 'name', 'is_organizer','phone_number','role','date_joined']
        read_only_fields = ['id','date_joined']

        def get_role(self, obj):
            return "Organizer" if obj.is_organizer else "Player"
        

class UserCreateSerializers(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['email', 'name', 'is_organizer','phone_number', 'password']  

        def validate_email(self, value):
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email is already in use.")
            return value

        def validate_password(self, value):
            if len(value) < 8:
                raise serializers.ValidationError("Password must be at least 8 characters long.")
            return value
        
        def validate_name(self, value):
            if not value.strip():
                raise serializers.ValidationError("Name cannot be empty.")
            return value
        
        def validate_phone_number(self, value):
            if value and not value.isdigit():
                raise serializers.ValidationError("Phone number must contain only digits.")
            return value
        
        def create(self, validated_data):
            user = User(
                email=validated_data['email'],
                name=validated_data.get('name', ''),
                is_organizer=validated_data.get('is_organizer', False)
            )
            user.set_password(validated_data['password'])
            user.save()
            return user
        
class UserLoginSerializers(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")
        
        attrs['user'] = user
        return attrs
    
class UserLogoutSerializers(serializers.Serializer):
    refresh = serializers.CharField()

        

