from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/leads/', include('leads.urls')),
    path('api/whatsapp/', include('whatsapp_integration.urls')),
    path('api/marketing/', include('marketing.urls')),
    path('api/quotations/', include('quotations.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/copilots/', include('copilots.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
