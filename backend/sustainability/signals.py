from django.db.models.signals import post_save
from django.dispatch import receiver
from inventory.models import TextileWaste
from .models import ImpactRecord
from .services import calculate_environmental_impact, recommend_strategy


@receiver(post_save, sender=TextileWaste)
def update_impact_record(sender, instance, **kwargs):
    contamination = instance.condition == 'Contaminated'

    if instance.circularity_score is not None:
        circularity_score = instance.circularity_score
    else:
        circularity_score = 40.0 if not contamination else 15.0

    impact = calculate_environmental_impact(
        instance.material_type, instance.quantity, circularity_score
    )

    strategy = recommend_strategy(
        circularity_score, instance.condition, contamination)

    ImpactRecord.objects.update_or_create(
        waste_batch=instance,
        defaults={
            "co2_saved_kg": impact["co2_saved_kg"],
            "water_saved_liters": impact["water_saved_liters"],
            "circularity_score": circularity_score,
            "recommended_strategy": strategy,
        }
    )
