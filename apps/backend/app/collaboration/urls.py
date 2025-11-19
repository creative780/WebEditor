from django.urls import path
from app.collaboration.views import (
    CollaboratorViewSet, CommentViewSet, VersionViewSet
)

urlpatterns = [
    # Collaborators - mounted at /api/designs/
    path('api/designs/<str:design_id>/collaborators/', 
         CollaboratorViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='collaborator-list'),
    path('api/designs/<str:design_id>/collaborators/<str:user_id>/', 
         CollaboratorViewSet.as_view({'delete': 'destroy'}), 
         name='collaborator-detail'),
    
    # Comments - mounted at /api/designs/
    path('api/designs/<str:design_id>/comments/', 
         CommentViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='comment-list'),
    # Comment resolve - can be accessed via /api/comments/:id/resolve or /api/designs/:designId/comments/:id/resolve
    path('api/comments/<uuid:pk>/resolve/', 
         CommentViewSet.as_view({'post': 'resolve'}), 
         name='comment-resolve'),
    path('api/comments/<uuid:pk>/', 
         CommentViewSet.as_view({'delete': 'destroy'}), 
         name='comment-detail'),
    
    # Versions - mounted at /api/designs/
    path('api/designs/<str:design_id>/versions/', 
         VersionViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='version-list'),
    # Version restore - can be accessed via /api/versions/:id/restore
    path('api/versions/<uuid:pk>/restore/', 
         VersionViewSet.as_view({'post': 'restore'}), 
         name='version-restore'),
]
