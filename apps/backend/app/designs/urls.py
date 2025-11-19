from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.designs.views import DesignViewSet

router = DefaultRouter()
router.register(r'api/designs', DesignViewSet, basename='design')

urlpatterns = [
    path('', include(router.urls)),
]
