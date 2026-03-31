from rest_framework import serializers
from .models import Lead, LeadNote, LeadActivity, Appointment, ServiceTicket
from accounts.serializers import UserSerializer


class LeadNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = LeadNote
        fields = '__all__'
        read_only_fields = ['lead', 'author']

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else 'System'


class LeadActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = LeadActivity
        fields = '__all__'

    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else 'System'


class AppointmentSerializer(serializers.ModelSerializer):
    lead_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['tenant', 'created_by']

    def get_lead_name(self, obj):
        return f"{obj.lead.first_name} {obj.lead.last_name}"


class LeadSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    notes_count = serializers.SerializerMethodField()
    activities_count = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        exclude = ['tenant']

    def get_owner_name(self, obj):
        return obj.owner.get_full_name() if obj.owner else 'Unassigned'

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_notes_count(self, obj):
        return obj.lead_notes.count()

    def get_activities_count(self, obj):
        return obj.activities.count()


class LeadDetailSerializer(LeadSerializer):
    """Detailed view including notes and activities"""
    notes = LeadNoteSerializer(source='lead_notes', many=True, read_only=True)
    activities = LeadActivitySerializer(many=True, read_only=True)
    appointments = AppointmentSerializer(many=True, read_only=True)

    class Meta(LeadSerializer.Meta):
        pass


class ServiceTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTicket
        exclude = ['tenant']
