from django.db import models
from inventory.models import TextileWaste


class ImpactRecord(models.Model):
    waste_batch = models.OneToOneField(
        TextileWaste, on_delete=models.CASCADE, related_name='impact'
    )
    co2_saved_kg = models.FloatField(default=0)
    water_saved_liters = models.FloatField(default=0)
    circularity_score = models.FloatField(default=0)
    recommended_strategy = models.CharField(max_length=100, blank=True)
    calculated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Impact for {self.waste_batch.batch_id}"