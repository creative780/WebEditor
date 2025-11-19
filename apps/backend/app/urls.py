"""
URL configuration for web-to-print backend.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.health.urls')),
    path('', include('app.designs.urls')),
    path('', include('app.collaboration.urls')),
    path('', include('app.design_templates.urls')),
    path('', include('app.exports.urls')),
    path('', include('app.shape_operations.urls')),
    path('', include('app.text.urls')),
    path('', include('app.colors.urls')),
    path('', include('app.layers.urls')),
    path('', include('app.monitoring.urls')),
    path('', include('app.analytics.urls')),
]
