"""
ASGI config for web-to-print backend.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import app.collaboration.routing
from app.health.routing import websocket_urlpatterns as health_websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Combine all WebSocket URL patterns
websocket_urlpatterns = (
    app.collaboration.routing.websocket_urlpatterns +
    health_websocket_urlpatterns
)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
