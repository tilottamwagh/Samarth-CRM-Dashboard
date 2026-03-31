from django.db import models
from accounts.models import Tenant, User
from leads.models import Lead
from whatsapp_integration.models import MessageTemplate, WhatsAppConfig


class Campaign(models.Model):
    """Bulk WhatsApp marketing campaign"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('paused', 'Paused'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='campaigns')
    name = models.CharField(max_length=200)
    wa_config = models.ForeignKey(WhatsAppConfig, on_delete=models.SET_NULL, null=True)
    template = models.ForeignKey(MessageTemplate, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    recipient_count = models.IntegerField(default=0)
    sent_count = models.IntegerField(default=0)
    delivered_count = models.IntegerField(default=0)
    read_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    excel_file = models.FileField(upload_to='campaign_files/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'campaigns'
        ordering = ['-created_at']


class CampaignRecipient(models.Model):
    """Individual recipient in a campaign"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
    ]

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='recipients')
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True)
    mobile = models.CharField(max_length=15)
    name = models.CharField(max_length=200, blank=True)
    template_variables = models.JSONField(default=dict)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    wa_message_id = models.CharField(max_length=100, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        db_table = 'campaign_recipients'
