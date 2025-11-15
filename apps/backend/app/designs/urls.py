from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DesignViewSet, object_detail

router = DefaultRouter()
router.register(r'designs', DesignViewSet, basename='design')

urlpatterns = [
    path('', include(router.urls)),
    path('designs/<uuid:design_id>/objects/<uuid:object_id>', object_detail, name='design-object-detail'),
]









