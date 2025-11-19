"""
WebSocket routing for collaboration features.
"""
from django.urls import re_path
from app.collaboration import consumers

websocket_urlpatterns = [
    re_path(r'ws/designs/(?P<design_id>[^/]+)/$', consumers.DesignConsumer.as_asgi()),
]


