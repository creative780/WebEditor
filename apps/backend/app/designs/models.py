import uuid
from django.db import models


class Design(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    width = models.DecimalField(max_digits=10, decimal_places=2)
    height = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, default='in')
    dpi = models.IntegerField(default=300)
    bleed = models.DecimalField(max_digits=10, decimal_places=2, default=0.125)
    color_mode = models.CharField(max_length=10, default='rgb')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class DesignObject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    design = models.ForeignKey(Design, related_name='objects', on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    x = models.DecimalField(max_digits=10, decimal_places=4)
    y = models.DecimalField(max_digits=10, decimal_places=4)
    width = models.DecimalField(max_digits=10, decimal_places=4)
    height = models.DecimalField(max_digits=10, decimal_places=4)
    rotation = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    opacity = models.DecimalField(max_digits=3, decimal_places=2, default=1)
    z_index = models.IntegerField()
    locked = models.BooleanField(default=False)
    visible = models.BooleanField(default=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    properties = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['design', 'z_index']),
        ]









