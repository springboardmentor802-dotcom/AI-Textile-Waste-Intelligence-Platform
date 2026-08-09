from rest_framework import serializers
from .models import ImpactRecord


class ImpactRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactRecord
        fields = [
            'id', 'waste_batch', 'co2_saved_kg', 'water_saved_liters',
            'circularity_score', 'recommended_strategy', 'calculated_at'
        ]