"""
Simple script to test Django API endpoints
Run this after starting the Django server: python manage.py runserver 8000
"""
import requests
import json

BASE_URL = 'http://localhost:8000'

def test_get_designs():
    """Test GET /api/designs/"""
    print("Testing GET /api/designs/")
    response = requests.get(f'{BASE_URL}/api/designs/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_create_design():
    """Test POST /api/designs/"""
    print("Testing POST /api/designs/")
    data = {
        'user_id': 'test-user-123',
        'name': 'Test Design',
        'width': 8.5,
        'height': 11,
        'unit': 'in',
        'dpi': 300,
        'bleed': 0.125,
        'color_mode': 'rgb'
    }
    response = requests.post(f'{BASE_URL}/api/designs/', json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    design_id = response.json().get('id')
    print(f"Created design ID: {design_id}")
    print()
    return design_id

def test_get_design(design_id):
    """Test GET /api/designs/:id/"""
    print(f"Testing GET /api/designs/{design_id}/")
    response = requests.get(f'{BASE_URL}/api/designs/{design_id}/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_get_collaborators(design_id):
    """Test GET /api/designs/:designId/collaborators/"""
    print(f"Testing GET /api/designs/{design_id}/collaborators/")
    response = requests.get(f'{BASE_URL}/api/designs/{design_id}/collaborators/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_create_comment(design_id):
    """Test POST /api/designs/:designId/comments/"""
    print(f"Testing POST /api/designs/{design_id}/comments/")
    data = {
        'user_id': 'test-user-123',
        'content': 'This is a test comment',
        'x': 100,
        'y': 200
    }
    response = requests.post(f'{BASE_URL}/api/designs/{design_id}/comments/', json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    comment_id = response.json().get('comment', {}).get('id')
    print(f"Created comment ID: {comment_id}")
    print()
    return comment_id

def test_get_comments(design_id):
    """Test GET /api/designs/:designId/comments/"""
    print(f"Testing GET /api/designs/{design_id}/comments/")
    response = requests.get(f'{BASE_URL}/api/designs/{design_id}/comments/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_get_versions(design_id):
    """Test GET /api/designs/:designId/versions/"""
    print(f"Testing GET /api/designs/{design_id}/versions/")
    response = requests.get(f'{BASE_URL}/api/designs/{design_id}/versions/')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

if __name__ == '__main__':
    print("=" * 60)
    print("Django API Endpoint Tests")
    print("=" * 60)
    print()
    
    try:
        # Test 1: List designs
        test_get_designs()
        
        # Test 2: Create design
        design_id = test_create_design()
        
        if design_id:
            # Test 3: Get design with objects
            test_get_design(design_id)
            
            # Test 4: Get collaborators
            test_get_collaborators(design_id)
            
            # Test 5: Create comment
            comment_id = test_create_comment(design_id)
            
            # Test 6: Get comments
            test_get_comments(design_id)
            
            # Test 7: Get versions
            test_get_versions(design_id)
        
        print("=" * 60)
        print("All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to Django server.")
        print("Make sure the server is running: python manage.py runserver 8000")
    except Exception as e:
        print(f"ERROR: {e}")


