from django.urls import path
from app.monitoring.views import MetricsViewSet

urlpatterns = [
    path('api/metrics/', MetricsViewSet.as_view({'get': 'metrics'}), name='metrics'),
    path('api/monitoring/performance/', MetricsViewSet.as_view({'get': 'performance'}), name='monitoring-performance'),
    path('api/monitoring/system/', MetricsViewSet.as_view({'get': 'system'}), name='monitoring-system'),
    path('api/monitoring/cache/', MetricsViewSet.as_view({'get': 'cache'}), name='monitoring-cache'),
]


