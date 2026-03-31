from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_metrics, name='dashboard-metrics'),
    path('appointments/', views.dashboard_appointments, name='dashboard-appointments'),
    path('pipeline/', views.pipeline_report, name='pipeline'),
    path('sentiment/', views.sentiment_report, name='sentiment'),
    path('sales-performance/', views.sales_performance, name='sales-performance'),
    path('lead-sources/', views.lead_source_breakdown, name='lead-sources'),
]
