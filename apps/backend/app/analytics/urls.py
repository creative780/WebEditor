from django.urls import path
from app.analytics.views import AnalyticsViewSet

urlpatterns = [
    path('api/analytics/event/', AnalyticsViewSet.as_view({'post': 'track_event'}), name='analytics-event'),
    path('api/analytics/stats/', AnalyticsViewSet.as_view({'get': 'get_stats'}), name='analytics-stats'),
]


