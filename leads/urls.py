from django.urls import path
from . import views
from accounts.views import (
    EmployeeListCreateView, EmployeeDetailView,
    DealerListCreateView, DealerDetailView
)

urlpatterns = [
    path('', views.LeadListCreateView.as_view(), name='leads'),
    path('<int:pk>/', views.LeadDetailView.as_view(), name='lead-detail'),
    path('bulk-upload/', views.bulk_upload_leads, name='bulk-upload'),
    path('scan-card/', views.scan_visiting_card, name='scan-card'),
    path('<int:lead_id>/notes/', views.LeadNoteListCreateView.as_view(), name='lead-notes'),
    path('appointments/', views.AppointmentListCreateView.as_view(), name='appointments'),
    path('appointments/<int:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('service-tickets/', views.ServiceTicketListCreateView.as_view(), name='service-tickets'),
    
    # User Management (proxied from accounts)
    path('users/', EmployeeListCreateView.as_view(), name='users'),
    path('users/<int:pk>/', EmployeeDetailView.as_view(), name='user-detail'),
    
    # Dealer Management (proxied from accounts)
    path('dealers/', DealerListCreateView.as_view(), name='dealers'),
    path('dealers/<int:pk>/', DealerDetailView.as_view(), name='dealer-detail'),
    path('recent-activity/', views.RecentActivityView.as_view(), name='recent-activity'),
]
