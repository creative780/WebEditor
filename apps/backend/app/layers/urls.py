from django.urls import path
from app.layers.views import LayerViewSet

urlpatterns = [
    path('api/designs/<str:design_id>/layers/reorder/', LayerViewSet.as_view({'post': 'reorder'}), name='layer-reorder'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/forward/', LayerViewSet.as_view({'post': 'forward'}), name='layer-forward'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/backward/', LayerViewSet.as_view({'post': 'backward'}), name='layer-backward'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/front/', LayerViewSet.as_view({'post': 'front'}), name='layer-front'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/back/', LayerViewSet.as_view({'post': 'back'}), name='layer-back'),
    path('api/designs/<str:design_id>/layers/group/', LayerViewSet.as_view({'post': 'group'}), name='layer-group'),
    path('api/designs/<str:design_id>/layers/ungroup/', LayerViewSet.as_view({'post': 'ungroup'}), name='layer-ungroup'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/lock/', LayerViewSet.as_view({'post': 'lock'}), name='layer-lock'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/unlock/', LayerViewSet.as_view({'post': 'unlock'}), name='layer-unlock'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/toggle-visibility/', LayerViewSet.as_view({'post': 'toggle_visibility'}), name='layer-toggle-visibility'),
    path('api/designs/<str:design_id>/layers/<str:object_id>/duplicate/', LayerViewSet.as_view({'post': 'duplicate'}), name='layer-duplicate'),
    path('api/designs/<str:design_id>/layers/hierarchy/', LayerViewSet.as_view({'get': 'hierarchy'}), name='layer-hierarchy'),
    path('api/layers/<str:layer_id>/blend-mode/', LayerViewSet.as_view({'post': 'blend_mode'}), name='layer-blend-mode'),
    path('api/layers/<str:layer_id>/effects/', LayerViewSet.as_view({'post': 'effects'}), name='layer-effects'),
]


