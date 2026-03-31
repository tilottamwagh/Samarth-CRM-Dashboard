from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tenant, Plan, SalesTarget, Dealer

User = get_user_model()


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'


class TenantSerializer(serializers.ModelSerializer):
    queries_left = serializers.ReadOnlyField()
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Tenant
        fields = ['id', 'name', 'slug', 'email', 'mobile', 'industry', 'logo', 'plan', 'ai_queries_used', 'queries_left', 'is_active', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    tenant = TenantSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'mobile', 'role', 'avatar', 'tenant', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'mobile', 'role', 'password']

    def create(self, validated_data):
        tenant = self.context.get('tenant')
        # Use a random string if no password is provided for internal users
        from django.utils.crypto import get_random_string
        password = validated_data.get('password') or get_random_string(12)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            mobile=validated_data.get('mobile', ''),
            role=validated_data.get('role', 'employee'),
            tenant=tenant,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class SalesTargetSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = SalesTarget
        fields = '__all__'

    def get_user_name(self, obj):
        return obj.user.get_full_name()


class DealerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dealer
        exclude = ['tenant']
