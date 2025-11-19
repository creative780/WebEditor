from django.urls import path
from app.shape_operations.views import ShapeViewSet

urlpatterns = [
    path('api/shapes/generate/', ShapeViewSet.as_view({'post': 'generate'}), name='shape-generate'),
    path('api/shapes/boolean/', ShapeViewSet.as_view({'post': 'boolean'}), name='shape-boolean'),
    path('api/shapes/simplify/', ShapeViewSet.as_view({'post': 'simplify'}), name='shape-simplify'),
    path('api/shapes/smooth/', ShapeViewSet.as_view({'post': 'smooth'}), name='shape-smooth'),
]


