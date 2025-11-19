import uuid
from django.db import models
from app.designs.models import Design


class DesignCollaborator(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    design = models.ForeignKey(Design, related_name='collaborators', on_delete=models.CASCADE, db_column='design_id')
    user_id = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    invited_by = models.CharField(max_length=255, null=True, blank=True)
    invited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'collaboration'
        db_table = 'design_collaborators'
        unique_together = [['design', 'user_id']]
        indexes = [
            models.Index(fields=['design']),
            models.Index(fields=['user_id']),
        ]

    def __str__(self):
        return f"{self.user_id} - {self.role} on {self.design.id}"


class DesignComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    design = models.ForeignKey(Design, related_name='comments', on_delete=models.CASCADE, db_column='design_id')
    user_id = models.CharField(max_length=255)
    object_id = models.UUIDField(null=True, blank=True)
    content = models.TextField()
    x = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    y = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    parent = models.ForeignKey('self', related_name='replies', on_delete=models.CASCADE, null=True, blank=True, db_column='parent_id')
    resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'collaboration'
        db_table = 'design_comments'
        indexes = [
            models.Index(fields=['design', '-created_at']),
            models.Index(fields=['object_id']),
            models.Index(fields=['parent']),
        ]

    def __str__(self):
        return f"Comment by {self.user_id} on {self.design.id}"


class DesignVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    design = models.ForeignKey(Design, related_name='versions', on_delete=models.CASCADE, db_column='design_id')
    version_number = models.IntegerField()
    created_by = models.CharField(max_length=255)
    snapshot = models.JSONField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'collaboration'
        db_table = 'design_versions'
        unique_together = [['design', 'version_number']]
        indexes = [
            models.Index(fields=['design', '-version_number']),
        ]

    def __str__(self):
        return f"Version {self.version_number} of {self.design.id}"


class DesignChangeLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    design = models.ForeignKey(Design, related_name='change_logs', on_delete=models.CASCADE, db_column='design_id')
    user_id = models.CharField(max_length=255)
    change_type = models.CharField(max_length=50)
    object_id = models.UUIDField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'collaboration'
        db_table = 'design_change_log'
        indexes = [
            models.Index(fields=['design', '-created_at']),
            models.Index(fields=['user_id']),
        ]

    def __str__(self):
        return f"{self.change_type} by {self.user_id} on {self.design.id}"
