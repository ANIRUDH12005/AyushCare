# backend/urls.py
from django.urls import path, include
from django.contrib import admin
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return JsonResponse({"message": "Backend working successfully!"})

urlpatterns = [
    path('', home),

    path('admin/', admin.site.urls),

    # Accounts (signup, login, OTP)
    path('api/', include('accounts.urls')),

    # Patient profile
    path('api/patient/', include('patients.urls')),

    # Appointments API
    path('api/appointments/', include('appointments.urls')),

    # Centers API
    path('api/centers/', include('centers.urls')),
    
    # Notifications API
    path('api/notifications/', include('notifications.urls')),
    
    # Progress Tracking API
    path('api/progress/', include('progress.urls')),
    
    # Payment API
    path('api/payment/', include('appointments.payment_urls')),
    
    # Clinic Management Dashboard API
    path('api/clinic/', include('clinic.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
