from django.urls import path
from rest_framework import generics, serializers, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Campaign, CampaignRecipient


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        exclude = ['tenant']


class CampaignListCreateView(generics.ListCreateAPIView):
    serializer_class = CampaignSerializer
    def get_queryset(self):
        return Campaign.objects.filter(tenant=self.request.user.tenant)
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)


class CampaignDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CampaignSerializer
    def get_queryset(self):
        return Campaign.objects.filter(tenant=self.request.user.tenant)


@api_view(['POST'])
def send_campaign(request, pk):
    """Launch campaign - sends to Celery queue"""
    try:
        campaign = Campaign.objects.get(pk=pk, tenant=request.user.tenant)
        campaign.status = 'running'
        campaign.save()
        # In production: trigger Celery task
        # from marketing.tasks import send_campaign_task
        # send_campaign_task.delay(campaign.id)
        return Response({'message': f'Campaign "{campaign.name}" started'})
    except Campaign.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def campaign_report(request, pk):
    try:
        campaign = Campaign.objects.get(pk=pk, tenant=request.user.tenant)
        return Response({
            'name': campaign.name,
            'status': campaign.status,
            'recipient_count': campaign.recipient_count,
            'sent_count': campaign.sent_count,
            'delivered_count': campaign.delivered_count,
            'read_count': campaign.read_count,
            'failed_count': campaign.failed_count,
            'delivery_rate': round((campaign.delivered_count / max(campaign.sent_count, 1)) * 100, 1),
            'read_rate': round((campaign.read_count / max(campaign.delivered_count, 1)) * 100, 1),
        })
    except Campaign.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


urlpatterns = [
    path('campaigns/', CampaignListCreateView.as_view()),
    path('campaigns/<int:pk>/', CampaignDetailView.as_view()),
    path('campaigns/<int:pk>/send/', send_campaign),
    path('campaigns/<int:pk>/report/', campaign_report),
]
