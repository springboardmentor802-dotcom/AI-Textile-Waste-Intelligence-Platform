import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


class TextileWaste(models.Model):
    MATERIAL_CHOICES = [
        ('Cotton', 'Cotton'),
        ('Polyester', 'Polyester'),
        ('Silk', 'Silk'),
        ('Wool', 'Wool'),
        ('Denim', 'Denim'),
    ]

    CONDITION_CHOICES = [
        ('New Surplus', 'New Surplus'),
        ('Lightly Used', 'Lightly Used'),
        ('Worn', 'Worn'),
        ('Damaged', 'Damaged'),
        ('Contaminated', 'Contaminated'),
    ]

    STATUS_CHOICES = [
        ('Registered', 'Registered'),
        ('Collected', 'Collected'),
        ('In Processing', 'In Processing'),
        ('Processed', 'Processed'),

    ]

    batch_id = models.CharField(max_length=20, unique=True, editable=False)
    material_type = models.CharField(max_length=100, choices=MATERIAL_CHOICES)
    quantity = models.FloatField()
    color = models.CharField(max_length=50)
    source = models.CharField(max_length=100)
    condition = models.CharField(
        max_length=20, choices=CONDITION_CHOICES, default='Worn'
    )
    detected_material = models.CharField(max_length=100, blank=True, null=True)
    circularity_score = models.FloatField(null=True, blank=True)
    waste_category = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Registered'
    )
    collection_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='waste_batches'
    )
    date_added = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.batch_id:
            self.batch_id = f"WB-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.batch_id} - {self.material_type} - {self.quantity} kg"


class UserProfile(models.Model):

    ROLE_CHOICES = [
        ('Recycling Facility Operator', 'Recycling Facility Operator'),
        ('Sustainability Manager', 'Sustainability Manager'),
        ('Textile Manufacturer Administrator',
         'Textile Manufacturer Administrator'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES
    )

    def __str__(self):
        return self.user.username


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("waste_added", "Waste Batch Added"),
        ("status_change", "Status Changed"),
        ("high_recyclability", "High Recyclability Alert"),
        ("hazardous", "Hazardous Waste Alert"),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(
        max_length=30, choices=NOTIFICATION_TYPES)
    message = models.CharField(max_length=255)
    related_batch = models.ForeignKey(
        "TextileWaste", null=True, blank=True, on_delete=models.SET_NULL)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
