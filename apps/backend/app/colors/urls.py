from django.urls import path
from app.colors.views import ColorViewSet

urlpatterns = [
    path('api/colors/convert/', ColorViewSet.as_view({'post': 'convert'}), name='color-convert'),
    path('api/colors/validate/', ColorViewSet.as_view({'post': 'validate'}), name='color-validate'),
    path('api/colors/validate/batch/', ColorViewSet.as_view({'post': 'validate_batch'}), name='color-validate-batch'),
    path('api/colors/pantone/search/', ColorViewSet.as_view({'get': 'pantone_search'}), name='pantone-search'),
    path('api/colors/pantone/', ColorViewSet.as_view({'get': 'pantone_list'}), name='pantone-list'),
    path('api/colors/pantone/<str:pk>/', ColorViewSet.as_view({'get': 'pantone_detail'}), name='pantone-detail'),
    path('api/colors/pantone/match/', ColorViewSet.as_view({'post': 'pantone_match'}), name='pantone-match'),
    path('api/colors/gradients/generate/', ColorViewSet.as_view({'post': 'gradients_generate'}), name='gradient-generate'),
    path('api/colors/gradients/optimize/', ColorViewSet.as_view({'post': 'gradients_optimize'}), name='gradient-optimize'),
    path('api/colors/harmony/', ColorViewSet.as_view({'post': 'harmony'}), name='color-harmony'),
    path('api/colors/palette/generate/', ColorViewSet.as_view({'post': 'palette_generate'}), name='palette-generate'),
    path('api/colors/palette/from-image/', ColorViewSet.as_view({'post': 'palette_from_image'}), name='palette-from-image'),
    path('api/colors/accessibility/', ColorViewSet.as_view({'post': 'accessibility'}), name='color-accessibility'),
    path('api/colors/interpolate/', ColorViewSet.as_view({'post': 'interpolate'}), name='color-interpolate'),
]


