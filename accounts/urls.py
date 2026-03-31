from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('me/', views.me_view, name='me'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Employees
    path('employees/', views.EmployeeListCreateView.as_view(), name='employees'),
    path('employees/<int:pk>/', views.EmployeeDetailView.as_view(), name='employee-detail'),
    # Dealers
    path('dealers/', views.DealerListCreateView.as_view(), name='dealers'),
    path('dealers/<int:pk>/', views.DealerDetailView.as_view(), name='dealer-detail'),
    # Profile Update
    path('update-profile/', views.update_profile, name='update-profile'),
]
