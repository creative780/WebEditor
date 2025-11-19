import uuid
from django.db import models
from app.designs.models import Design


class ExportJob(models.Model):
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('png', 'PNG'),
        ('jpg', 'JPG'),
        ('svg', 'SVG'),
    ]
    
    QUALITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('ultra', 'Ultra'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    design = models.ForeignKey(Design, related_name='export_jobs', on_delete=models.CASCADE, db_column='design_id')
    user_id = models.CharField(max_length=255)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    quality = models.CharField(max_length=10, choices=QUALITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    options = models.JSONField(blank=True, null=True)
    result_url = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'exports'
        db_table = 'export_jobs'
        indexes = [
            models.Index(fields=['design']),
            models.Index(fields=['user_id', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return f"Export {self.format} job for {self.design_id} - {self.status}"
