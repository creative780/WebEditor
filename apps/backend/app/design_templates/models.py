import uuid
from django.db import models


class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)  # Store as JSON array
    thumbnail_url = models.TextField(blank=True, null=True)
    preview_url = models.TextField(blank=True, null=True)
    design_data = models.JSONField()
    is_public = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    downloads = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'design_templates'
        db_table = 'templates'
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['industry']),
            models.Index(fields=['-downloads', '-rating']),
        ]

    def __str__(self):
        return self.name


class TemplateVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(Template, related_name='versions', on_delete=models.CASCADE, db_column='template_id')
    version_number = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    design_data = models.JSONField()
    created_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'design_templates'
        db_table = 'template_versions'
        unique_together = [['template', 'version_number']]
        indexes = [
            models.Index(fields=['template', '-version_number']),
        ]

    def __str__(self):
        return f"Version {self.version_number} of {self.template.name}"


class TemplateShare(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(Template, related_name='shares', on_delete=models.CASCADE, db_column='template_id')
    share_token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    password_hash = models.CharField(max_length=255, blank=True, null=True)
    access_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'design_templates'
        db_table = 'template_shares'
        indexes = [
            models.Index(fields=['share_token']),
            models.Index(fields=['template']),
        ]

    def __str__(self):
        return f"Share token for {self.template.name}"


class TemplateAnalytics(models.Model):
    EVENT_CHOICES = [
        ('view', 'View'),
        ('use', 'Use'),
        ('download', 'Download'),
    ]
    
    id = models.BigAutoField(primary_key=True)
    template = models.ForeignKey(Template, related_name='analytics', on_delete=models.CASCADE, db_column='template_id')
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    user_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'design_templates'
        db_table = 'template_analytics'
        indexes = [
            models.Index(fields=['template', '-created_at']),
            models.Index(fields=['event_type', '-created_at']),
        ]

    def __str__(self):
        return f"{self.event_type} on {self.template.name}"


class TemplateFavorite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(Template, related_name='favorites', on_delete=models.CASCADE, db_column='template_id')
    user_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'design_templates'
        db_table = 'template_favorites'
        unique_together = [['template', 'user_id']]
        indexes = [
            models.Index(fields=['user_id']),
        ]

    def __str__(self):
        return f"{self.user_id} favorited {self.template.name}"
