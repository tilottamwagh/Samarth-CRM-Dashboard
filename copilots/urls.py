from django.urls import path
from rest_framework import generics, serializers
from .models import AICopilot, CopilotTrainingData


class CopilotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AICopilot
        exclude = ['tenant']


class TrainingDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CopilotTrainingData
        fields = '__all__'


class CopilotListCreateView(generics.ListCreateAPIView):
    serializer_class = CopilotSerializer
    def get_queryset(self):
        return AICopilot.objects.filter(tenant=self.request.user.tenant)
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)


class CopilotDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CopilotSerializer
    def get_queryset(self):
        return AICopilot.objects.filter(tenant=self.request.user.tenant)


urlpatterns = [
    path('', CopilotListCreateView.as_view()),
    path('<int:pk>/', CopilotDetailView.as_view()),
]
