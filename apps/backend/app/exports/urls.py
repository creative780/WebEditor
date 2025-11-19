from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.exports.views import ExportJobViewSet

router = DefaultRouter()
router.register(r'api/exports', ExportJobViewSet, basename='export')

urlpatterns = [
    path('', include(router.urls)),
    path('api/exports/jobs/<str:job_id>/', ExportJobViewSet.as_view({'get': 'get_job_status'}), name='export-job-status'),
    path('api/exports/history/<str:user_id>/', ExportJobViewSet.as_view({'get': 'get_history'}), name='export-history'),
    path('api/exports/batch/', ExportJobViewSet.as_view({'post': 'batch_export'}), name='export-batch'),
    path('api/exports/stats/<str:user_id>/', ExportJobViewSet.as_view({'get': 'get_stats'}), name='export-stats'),
]


