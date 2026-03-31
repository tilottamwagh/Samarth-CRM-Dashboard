from django.db import models
from accounts.models import Tenant, User
from whatsapp_integration.models import WhatsAppConfig


class AICopilot(models.Model):
    """AI Bot configuration per tenant"""
    MODEL_CHOICES = [
        ('gpt-4o', 'GPT-4o'),
        ('gpt-4o-mini', 'GPT-4o Mini'),
        ('gemini-pro', 'Gemini Pro'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='copilots')
    wa_config = models.ForeignKey(WhatsAppConfig, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100)
    system_prompt = models.TextField(help_text='System instruction for the AI bot')
    model = models.CharField(max_length=20, choices=MODEL_CHOICES, default='gpt-4o-mini')
    temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=500)
    is_active = models.BooleanField(default=True)
    auto_reply = models.BooleanField(default=True)
    business_hours_only = models.BooleanField(default=False)
    greeting_message = models.TextField(blank=True)
    fallback_message = models.TextField(blank=True, default='I will connect you with our team shortly.')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.tenant.name})"

    class Meta:
        db_table = 'ai_copilots'


class CopilotTrainingData(models.Model):
    """Custom training/FAQ data for the copilot"""
    copilot = models.ForeignKey(AICopilot, on_delete=models.CASCADE, related_name='training_data')
    question = models.TextField()
    answer = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'copilot_training_data'
