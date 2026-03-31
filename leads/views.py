from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q, Sum, Count
from django.utils import timezone
import openpyxl
import io

from .models import Lead, LeadNote, LeadActivity, Appointment, ServiceTicket
from .serializers import (
    LeadSerializer, LeadDetailSerializer, LeadNoteSerializer,
    LeadActivitySerializer, AppointmentSerializer, ServiceTicketSerializer
)


class LeadListCreateView(generics.ListCreateAPIView):
    serializer_class = LeadSerializer

    def get_queryset(self):
        qs = Lead.objects.filter(tenant=self.request.user.tenant)
        # Filters
        stage = self.request.query_params.get('stage')
        status = self.request.query_params.get('status')
        source = self.request.query_params.get('source')
        owner = self.request.query_params.get('owner')
        q = self.request.query_params.get('q')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if stage:
            qs = qs.filter(stage=stage)
        if status:
            qs = qs.filter(status=status)
        if source:
            qs = qs.filter(lead_source=source)
        if owner:
            qs = qs.filter(owner_id=owner)
        if q:
            qs = qs.filter(
                Q(first_name__icontains=q) | Q(last_name__icontains=q) |
                Q(mobile__icontains=q) | Q(email__icontains=q) |
                Q(city__icontains=q)
            )
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        # Role-based filter: employees see only their own leads
        if self.request.user.role == 'employee':
            qs = qs.filter(owner=self.request.user)

        return qs

    def perform_create(self, serializer):
        lead = serializer.save(tenant=self.request.user.tenant, owner=self.request.user)
        LeadActivity.objects.create(
            lead=lead,
            user=self.request.user,
            action_type='created',
            description=f'Lead created by {self.request.user.get_full_name()}'
        )


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LeadDetailSerializer

    def get_queryset(self):
        return Lead.objects.filter(tenant=self.request.user.tenant)

    def perform_update(self, serializer):
        old_stage = self.get_object().stage
        lead = serializer.save()
        if old_stage != lead.stage:
            LeadActivity.objects.create(
                lead=lead,
                user=self.request.user,
                action_type='stage_changed',
                description=f'Stage changed from {old_stage} to {lead.stage}'
            )


@api_view(['POST'])
def bulk_upload_leads(request):
    """Upload leads from Excel file"""
    file = request.FILES.get('file')
    if not file:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        wb = openpyxl.load_workbook(file)
        ws = wb.active
        leads_created = 0
        errors = []

        for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if not row[0]:
                continue
            try:
                Lead.objects.create(
                    tenant=request.user.tenant,
                    first_name=row[0] or '',
                    last_name=row[1] or '',
                    mobile=str(row[2] or ''),
                    city=row[3] or '',
                    email=row[4] or '',
                    lead_source='bulk_upload',
                    owner=request.user,
                )
                leads_created += 1
            except Exception as e:
                errors.append(f'Row {i}: {str(e)}')

        return Response({
            'created': leads_created,
            'errors': errors,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def scan_visiting_card(request):
    """OCR business card scanning (placeholder - integrates with Google Vision)"""
    # In production, send image to Google Vision API
    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Mock response for now - replace with actual OCR
    return Response({
        'first_name': '',
        'last_name': '',
        'mobile': '',
        'email': '',
        'city': '',
        'company': '',
        'message': 'OCR extraction attempted. Please verify the details.',
    })


class LeadNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = LeadNoteSerializer

    def get_queryset(self):
        return LeadNote.objects.filter(lead_id=self.kwargs['lead_id'], lead__tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        lead = Lead.objects.get(pk=self.kwargs['lead_id'], tenant=self.request.user.tenant)
        serializer.save(lead=lead, author=self.request.user)


class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(tenant=self.request.user.tenant)


class ServiceTicketListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceTicketSerializer

    def get_queryset(self):
        return ServiceTicket.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)
