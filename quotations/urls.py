from django.urls import path
from rest_framework import generics, serializers
from .models import Quotation, QuotationItem


class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)
    lead_name = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        exclude = ['tenant']

    def get_lead_name(self, obj):
        return f"{obj.lead.first_name} {obj.lead.last_name}"


class QuotationListCreateView(generics.ListCreateAPIView):
    serializer_class = QuotationSerializer
    def get_queryset(self):
        return Quotation.objects.filter(tenant=self.request.user.tenant)
    def perform_create(self, serializer):
        import uuid
        quote_number = f"Q{uuid.uuid4().hex[:8].upper()}"
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user, quote_number=quote_number)


class QuotationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = QuotationSerializer
    def get_queryset(self):
        return Quotation.objects.filter(tenant=self.request.user.tenant)


urlpatterns = [
    path('', QuotationListCreateView.as_view()),
    path('<int:pk>/', QuotationDetailView.as_view()),
]
