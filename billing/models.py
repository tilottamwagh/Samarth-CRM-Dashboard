from django.db import models
from accounts.models import Tenant


class Subscription(models.Model):
    """Tenant subscription records"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('trial', 'Trial'),
        ('paused', 'Paused'),
    ]
    PERIOD_CHOICES = [('monthly', 'Monthly'), ('yearly', 'Yearly')]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='subscriptions')
    plan_name = models.CharField(max_length=100)
    plan_slug = models.CharField(max_length=50)
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='monthly')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    start_date = models.DateField()
    end_date = models.DateField()
    razorpay_subscription_id = models.CharField(max_length=100, blank=True)
    razorpay_plan_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subscriptions'
        ordering = ['-created_at']


class Payment(models.Model):
    """Payment history"""
    STATUS_CHOICES = [('captured', 'Captured'), ('failed', 'Failed'), ('refunded', 'Refunded'), ('pending', 'Pending')]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, related_name='payments')
    razorpay_payment_id = models.CharField(max_length=100, unique=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    method = models.CharField(max_length=50, blank=True)  # upi, card, netbanking
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
