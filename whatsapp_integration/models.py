from django.db import models
from accounts.models import Tenant, User
from leads.models import Lead


class WhatsAppConfig(models.Model):
    """WhatsApp Cloud API configuration per tenant"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='whatsapp_configs')
    phone_number_id = models.CharField(max_length=50)
    whatsapp_account_id = models.CharField(max_length=50, blank=True)
    display_phone_number = models.CharField(max_length=20)
    access_token = models.TextField()
    webhook_verify_token = models.CharField(max_length=100)
    business_name = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    connected_at = models.DateTimeField(auto_now_add=True)
    meta_app_id = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.display_phone_number} ({self.tenant.name})"

    class Meta:
        db_table = 'whatsapp_configs'


class MessageTemplate(models.Model):
    """WhatsApp Message Templates"""
    CATEGORY_CHOICES = [
        ('marketing', 'Marketing'),
        ('utility', 'Utility'),
        ('authentication', 'Authentication'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paused', 'Paused'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='templates')
    wa_config = models.ForeignKey(WhatsAppConfig, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='marketing')
    language = models.CharField(max_length=10, default='en')
    header_type = models.CharField(max_length=20, blank=True)  # text, image, video, document
    header_content = models.TextField(blank=True)
    body = models.TextField()
    footer = models.CharField(max_length=60, blank=True)
    buttons = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    meta_template_id = models.CharField(max_length=50, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category})"

    class Meta:
        db_table = 'message_templates'


class Conversation(models.Model):
    """WhatsApp conversation thread with a lead"""
    STATUS_CHOICES = [('open', 'Open'), ('closed', 'Closed'), ('bot', 'Bot Active')]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='conversations')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='conversations')
    wa_config = models.ForeignKey(WhatsAppConfig, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    unread_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-last_message_at']


class Message(models.Model):
    """Individual WhatsApp message"""
    TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('document', 'Document'),
        ('audio', 'Audio'),
        ('video', 'Video'),
        ('template', 'Template'),
        ('interactive', 'Interactive'),
    ]
    DIRECTION_CHOICES = [('inbound', 'Inbound'), ('outbound', 'Outbound')]
    STATUS_CHOICES = [('sent', 'Sent'), ('delivered', 'Delivered'), ('read', 'Read'), ('failed', 'Failed')]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='messages')
    wa_message_id = models.CharField(max_length=100, blank=True)  # Meta's message ID
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    message_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='text')
    content = models.TextField()
    media_url = models.URLField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    sent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_ai_generated = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['timestamp']


class SentimentRecord(models.Model):
    """AI sentiment analysis for a conversation"""
    SENTIMENT_CHOICES = [('positive', 'Positive'), ('neutral', 'Neutral'), ('negative', 'Negative')]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='sentiments')
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES)
    score = models.FloatField(default=0.0)  # 0.0 to 1.0
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sentiment_records'
