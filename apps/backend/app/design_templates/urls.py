from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.design_templates.views import TemplateViewSet

router = DefaultRouter()
router.register(r'api/templates', TemplateViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
]


