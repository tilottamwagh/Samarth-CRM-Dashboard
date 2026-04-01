from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from .models import Tenant, Plan, Dealer, SalesTarget, Employee
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    TenantSerializer, DealerSerializer, SalesTargetSerializer,
    EmployeeSerializer, EmployeeCreateSerializer
)

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = authenticate(
        request,
        username=serializer.validated_data['email'],
        password=serializer.validated_data['password']
    )
    if not user:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({'error': 'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)

    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])

    tokens = get_tokens_for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens,
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Register new tenant + admin user"""
    data = request.data
    # Create tenant
    tenant_data = {
        'name': data.get('company_name', ''),
        'slug': data.get('company_name', '').lower().replace(' ', '-'),
        'email': data.get('email'),
        'mobile': data.get('mobile', ''),
        'industry': data.get('industry', ''),
    }
    # Assign starter plan
    plan = Plan.objects.filter(slug='starter').first()
    tenant = Tenant.objects.create(**tenant_data, plan=plan)

    # Create admin user
    user = User.objects.create_user(
        email=data.get('email'),
        password=data.get('password'),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        mobile=data.get('mobile', ''),
        role='admin',
        tenant=tenant,
    )

    tokens = get_tokens_for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': tokens,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully'})


class EmployeeListCreateView(generics.ListCreateAPIView):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        return Employee.objects.filter(tenant=self.request.user.tenant)

    def create(self, request, *args, **kwargs):
        serializer = EmployeeCreateSerializer(data=request.data, context={'tenant': request.user.tenant})
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        return Employee.objects.filter(tenant=self.request.user.tenant)


class DealerListCreateView(generics.ListCreateAPIView):
    serializer_class = DealerSerializer

    def get_queryset(self):
        return Dealer.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class DealerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DealerSerializer

    def get_queryset(self):
        return Dealer.objects.filter(tenant=self.request.user.tenant)


class SalesTargetView(generics.ListCreateAPIView):
    serializer_class = SalesTargetSerializer

    def get_queryset(self):
        return SalesTarget.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
@api_view(['PATCH'])
def update_profile(request):
    user = request.user
    data = request.data

    # Update User fields
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.mobile = data.get('mobile', user.mobile)
    user.save()

    # Update Tenant fields if user is admin/superadmin
    if user.role in ['admin', 'superadmin'] and user.tenant:
        tenant = user.tenant
        tenant.name = data.get('business_name', tenant.name)
        tenant.industry = data.get('industry', tenant.industry)
        tenant.gst_number = data.get('gst_number', tenant.gst_number)
        tenant.website = data.get('website', tenant.website)
        tenant.address = data.get('address', tenant.address)
        tenant.save()

    return Response(UserSerializer(user).data)
