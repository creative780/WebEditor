"""
WebSocket consumers for real-time collaboration features.
Replaces Socket.IO functionality with Django Channels.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from app.designs.models import Design
from app.collaboration.models import DesignComment


class DesignConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for design collaboration.
    Handles real-time updates for comments, presence, and cursor movements.
    """
    
    async def connect(self):
        """
        Called when WebSocket connection is established.
        """
        self.design_id = self.scope['url_route']['kwargs']['design_id']
        self.room_group_name = f'design_{self.design_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'message': 'Connected to design room'
        }))
    
    async def disconnect(self, close_code):
        """
        Called when WebSocket connection is closed.
        """
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        """
        Handle messages from WebSocket client.
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'design:join':
                await self.handle_design_join(data)
            elif message_type == 'cursor:move':
                await self.handle_cursor_move(data)
            else:
                # Forward other messages to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'forward_message',
                        'data': data
                    }
                )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def handle_design_join(self, data):
        """
        Handle user joining a design room.
        """
        user_id = data.get('userId')
        
        # Broadcast user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'userId': user_id,
                'socketId': self.channel_name
            }
        )
    
    async def handle_cursor_move(self, data):
        """
        Handle cursor movement.
        """
        x = data.get('x')
        y = data.get('y')
        user_id = data.get('userId', 'unknown')
        
        # Broadcast cursor position
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'cursor_update',
                'userId': user_id,
                'x': x,
                'y': y
            }
        )
    
    # Handler methods for group messages
    
    async def user_joined(self, event):
        """
        Send user joined event to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'user:joined',
            'userId': event['userId'],
            'socketId': event['socketId']
        }))
    
    async def user_left(self, event):
        """
        Send user left event to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'user:left',
            'userId': event['userId']
        }))
    
    async def cursor_update(self, event):
        """
        Send cursor update to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'cursor:update',
            'userId': event['userId'],
            'x': event['x'],
            'y': event['y']
        }))
    
    async def comment_created(self, event):
        """
        Send comment created event to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'comment:created',
            'comment': event['comment']
        }))
    
    async def comment_resolved(self, event):
        """
        Send comment resolved event to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'comment:resolved',
            'comment': event['comment']
        }))
    
    async def comment_deleted(self, event):
        """
        Send comment deleted event to WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'comment:deleted',
            'id': event['id']
        }))
    
    async def forward_message(self, event):
        """
        Forward a message to WebSocket.
        """
        await self.send(text_data=json.dumps(event['data']))


# Signal handlers to broadcast database changes
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()


@receiver(post_save, sender=DesignComment)
def comment_saved(sender, instance, created, **kwargs):
    """
    Broadcast when a comment is created or updated.
    """
    if channel_layer and created:
        from asgiref.sync import async_to_sync
        from app.collaboration.serializers import CommentSerializer
        
        serializer = CommentSerializer(instance)
        async_to_sync(channel_layer.group_send)(
            f'design_{instance.design.id}',
            {
                'type': 'comment_created',
                'comment': serializer.data
            }
        )


@receiver(post_save, sender=DesignComment)
def comment_resolved_signal(sender, instance, **kwargs):
    """
    Broadcast when a comment is resolved.
    """
    if channel_layer and instance.resolved:
        from asgiref.sync import async_to_sync
        from app.collaboration.serializers import CommentSerializer
        
        serializer = CommentSerializer(instance)
        async_to_sync(channel_layer.group_send)(
            f'design_{instance.design.id}',
            {
                'type': 'comment_resolved',
                'comment': serializer.data
            }
        )


@receiver(post_delete, sender=DesignComment)
def comment_deleted_signal(sender, instance, **kwargs):
    """
    Broadcast when a comment is deleted.
    """
    if channel_layer:
        from asgiref.sync import async_to_sync
        
        async_to_sync(channel_layer.group_send)(
            f'design_{instance.design.id}',
            {
                'type': 'comment_deleted',
                'id': str(instance.id)
            }
        )


