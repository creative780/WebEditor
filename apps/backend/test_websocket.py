"""
Simple script to test Django WebSocket connections
Requires: pip install websockets
Run this after starting the Django server with ASGI: daphne app.asgi:application --port 8000
Or use: python manage.py runserver (for HTTP only, WebSocket needs ASGI server like daphne)
"""
import asyncio
import websockets
import json

async def test_websocket():
    """Test WebSocket connection to design room"""
    uri = "ws://localhost:8000/ws/designs/test-design-123/"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # Send design:join message
            join_message = {
                "type": "design:join",
                "userId": "test-user-123",
                "designId": "test-design-123"
            }
            await websocket.send(json.dumps(join_message))
            print("Sent: design:join")
            
            # Send cursor movement
            cursor_message = {
                "type": "cursor:move",
                "x": 100,
                "y": 200,
                "userId": "test-user-123"
            }
            await websocket.send(json.dumps(cursor_message))
            print("Sent: cursor:move")
            
            # Wait for responses
            print("Waiting for messages...")
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"Received: {response}")
            except asyncio.TimeoutError:
                print("No response received within 5 seconds")
            
            print("WebSocket test completed")
            
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"WebSocket connection failed: {e}")
        print("Note: Django runserver doesn't support WebSockets. Use daphne or uvicorn with ASGI.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    print("=" * 60)
    print("Django WebSocket Test")
    print("=" * 60)
    print()
    print("Note: Django's runserver doesn't fully support WebSockets.")
    print("For WebSocket testing, use an ASGI server like:")
    print("  daphne app.asgi:application --port 8000")
    print("  or")
    print("  uvicorn app.asgi:application --port 8000")
    print()
    asyncio.run(test_websocket())


