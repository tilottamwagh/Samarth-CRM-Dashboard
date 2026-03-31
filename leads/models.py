from django.db import models
from accounts.models import Tenant, User


class Lead(models.Model):
    """Core Lead/Customer record"""
    STAGE_CHOICES = [
        ('new', 'New'),
        ('mql', 'MQL'),
        ('sql', 'SQL'),
        ('proposal', 'Proposal Shared'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('hold', 'Hold'),
        ('won', 'Won'),
        ('lost', 'Lost'),
        ('call_later', 'Call Later'),
    ]
    SOURCE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('website', 'Website'),
        ('referral', 'Referral'),
        ('cold_call', 'Cold Call'),
        ('social_media', 'Social Media'),
        ('exhibition', 'Exhibition'),
        ('walk_in', 'Walk-in'),
        ('bulk_upload', 'Bulk Upload'),
        ('visiting_card', 'Visiting Card Scan'),
        ('other', 'Other'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='leads')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    mobile = models.CharField(max_length=15)
    country_code = models.CharField(max_length=5, default='91')
    city = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    lead_source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='other')
    industry = models.CharField(max_length=100, blank=True)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='new')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    deal_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_leads')
    product_interest = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    visiting_card_image = models.ImageField(upload_to='visiting_cards/', null=True, blank=True)
    # AI data
    ai_score = models.IntegerField(default=0)  # 0-100 lead score
    last_interaction_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.mobile})"

    class Meta:
        db_table = 'leads'
        ordering = ['-created_at']


class LeadNote(models.Model):
    """Notes/comments on a lead"""
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='lead_notes')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lead_notes'
        ordering = ['-created_at']


class LeadActivity(models.Model):
    """Activity log for leads"""
    ACTION_TYPES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('stage_changed', 'Stage Changed'),
        ('note_added', 'Note Added'),
        ('whatsapp_sent', 'WhatsApp Sent'),
        ('whatsapp_received', 'WhatsApp Received'),
        ('appointment_set', 'Appointment Set'),
        ('quotation_created', 'Quotation Created'),
        ('call', 'Call'),
    ]
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action_type = models.CharField(max_length=30, choices=ACTION_TYPES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lead_activities'
        ordering = ['-created_at']


class Appointment(models.Model):
    """Appointments linked to leads"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='appointments')
    product = models.CharField(max_length=200)
    location = models.CharField(max_length=300, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    scheduled_at = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-scheduled_at']


class ServiceTicket(models.Model):
    """Customer support tickets"""
    PRIORITY_CHOICES = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')]
    STATUS_CHOICES = [('open', 'Open'), ('in_progress', 'In Progress'), ('resolved', 'Resolved'), ('closed', 'Closed')]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='tickets', null=True)
    title = models.CharField(max_length=300)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'service_tickets'
