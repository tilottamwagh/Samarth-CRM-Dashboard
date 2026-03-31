from django.db import models
from accounts.models import Tenant, User
from leads.models import Lead


class Quotation(models.Model):
    """Quotation generated for a lead"""
    TYPE_CHOICES = [
        ('automotive', 'Automotive'),
        ('real_estate', 'Real Estate'),
        ('general', 'General'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='quotations')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='quotations')
    quote_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    quote_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=300)
    details = models.JSONField(default=dict)
    total_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True)
    valid_until = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quote #{self.quote_number} - {self.lead}"

    class Meta:
        db_table = 'quotations'
        ordering = ['-created_at']


class QuotationItem(models.Model):
    """Line items in a quotation"""
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=14, decimal_places=2)

    class Meta:
        db_table = 'quotation_items'
