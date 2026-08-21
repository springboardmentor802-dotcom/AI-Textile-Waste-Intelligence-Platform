from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TextileWaste, Notification


@receiver(post_save, sender=TextileWaste)
def notify_on_waste_event(sender, instance, created, **kwargs):
    if not instance.created_by:
        return  # skip if no user is linked to this batch

    if created:
        Notification.objects.create(
            user=instance.created_by,
            notification_type="waste_added",
            message=f"New batch {instance.batch_id} ({instance.material_type}) registered.",
            related_batch=instance,
        )
    else:
        if instance.status == "Processed":
            Notification.objects.create(
                user=instance.created_by,
                notification_type="status_change",
                message=f"Batch {instance.batch_id} marked as Processed.",
                related_batch=instance,
            )
        if instance.circularity_score is not None and instance.circularity_score >= 80:
            Notification.objects.create(
                user=instance.created_by,
                notification_type="high_recyclability",
                message=f"Batch {instance.batch_id} has a high circularity score ({instance.circularity_score}%).",
                related_batch=instance,
            )
        if instance.waste_category == "Hazardous Textile Waste":
            Notification.objects.create(
                user=instance.created_by,
                notification_type="hazardous",
                message=f"Batch {instance.batch_id} flagged as Hazardous Textile Waste.",
                related_batch=instance,
            )
