from django.urls import path
from rest_framework import generics, serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Subscription, Payment
from accounts.models import Plan


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


@api_view(['GET'])
def subscription_status(request):
    tenant = request.user.tenant
    subscription = Subscription.objects.filter(tenant=tenant, status='active').first()
    return Response({
        'tenant': tenant.name,
        'plan': tenant.plan.name if tenant.plan else 'No Plan',
        'plan_slug': tenant.plan.slug if tenant.plan else '',
        'queries_left': tenant.queries_left,
        'ai_queries_used': tenant.ai_queries_used,
        'max_queries': tenant.plan.ai_queries_limit if tenant.plan else 0,
        'subscription': SubscriptionSerializer(subscription).data if subscription else None,
    })


@api_view(['GET'])
def billing_history(request):
    tenant = request.user.tenant
    payments = Payment.objects.filter(tenant=tenant).order_by('-created_at')[:20]
    return Response(PaymentSerializer(payments, many=True).data)


@api_view(['GET'])
def available_plans(request):
    plans = Plan.objects.filter(is_active=True)
    return Response(PlanSerializer(plans, many=True).data)


@api_view(['POST'])
def create_order(request):
    """Create Razorpay order for plan upgrade"""
    import razorpay
    from django.conf import settings
    plan_slug = request.data.get('plan_slug')
    period = request.data.get('period', 'monthly')

    plan = Plan.objects.get(slug=plan_slug)
    amount = int(plan.price_monthly * 100) if period == 'monthly' else int(plan.price_yearly * 100)

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    order = client.order.create({'amount': amount, 'currency': 'INR', 'receipt': f'samarth_{request.user.id}'})
    return Response(order)


urlpatterns = [
    path('subscription/', subscription_status),
    path('history/', billing_history),
    path('plans/', available_plans),
    path('create-order/', create_order),
]
