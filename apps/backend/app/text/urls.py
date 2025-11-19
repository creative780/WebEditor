from django.urls import path
from app.text.views import TextViewSet

urlpatterns = [
    path('api/text/fonts/', TextViewSet.as_view({'get': 'fonts'}), name='text-fonts'),
    path('api/text/metrics/', TextViewSet.as_view({'post': 'metrics'}), name='text-metrics'),
    path('api/text/format/', TextViewSet.as_view({'post': 'format'}), name='text-format'),
    path('api/text/text-on-path/', TextViewSet.as_view({'post': 'text_on_path'}), name='text-on-path'),
]


