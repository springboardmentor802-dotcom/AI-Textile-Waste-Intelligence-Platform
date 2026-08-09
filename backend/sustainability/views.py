from django.db.models import Sum, Avg, Count
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ImpactRecord
from inventory.models import TextileWaste


@api_view(['GET'])
def sustainability_summary(request):
    """
    Facility-wide sustainability summary.
    Aggregates all ImpactRecord rows into single totals/averages.
    """
    records = ImpactRecord.objects.all()

    total_co2_saved = records.aggregate(
        total=Sum('co2_saved_kg'))['total'] or 0
    total_water_saved = records.aggregate(
        total=Sum('water_saved_liters'))['total'] or 0
    avg_circularity_score = records.aggregate(
        avg=Avg('circularity_score'))['avg'] or 0

    total_batches = TextileWaste.objects.count()
    processed_batches = TextileWaste.objects.filter(status='Processed').count()
    diversion_rate = (processed_batches / total_batches *
                      100) if total_batches else 0

    return Response({
        "total_co2_saved_kg": round(total_co2_saved, 2),
        "total_water_saved_liters": round(total_water_saved, 2),
        "average_circularity_score": round(avg_circularity_score, 2),
        "total_batches": total_batches,
        "processed_batches": processed_batches,
        "waste_diversion_rate_percent": round(diversion_rate, 2),
    })
from django.db.models.functions import TruncMonth
from inventory.models import TextileWaste


@api_view(['GET'])
def sustainability_trends(request):
    """
    Circular Economy Analytics.
    Returns two breakdowns:
      1. Impact grouped by material type (bar chart data)
      2. Impact grouped by month (line chart / trend data)
    """
    records = ImpactRecord.objects.select_related('waste_batch')

    # --- Breakdown by material type ---
    by_material = (
        records.values('waste_batch__material_type')
        .annotate(
            total_co2=Sum('co2_saved_kg'),
            total_water=Sum('water_saved_liters'),
            avg_circularity=Avg('circularity_score'),
            batch_count=Count('id'),
        )
        .order_by('-total_co2')
    )

    material_breakdown = [
        {
            "material": row["waste_batch__material_type"],
            "total_co2_saved_kg": round(row["total_co2"] or 0, 2),
            "total_water_saved_liters": round(row["total_water"] or 0, 2),
            "average_circularity_score": round(row["avg_circularity"] or 0, 2),
            "batch_count": row["batch_count"],
        }
        for row in by_material
    ]

    # --- Monthly trend ---
    by_month = (
        records.annotate(month=TruncMonth('calculated_at'))
        .values('month')
        .annotate(
            total_co2=Sum('co2_saved_kg'),
            total_water=Sum('water_saved_liters'),
            batch_count=Count('id'),
        )
        .order_by('month')
    )

    monthly_trend = [
        {
            "month": row["month"].strftime("%Y-%m"),
            "total_co2_saved_kg": round(row["total_co2"] or 0, 2),
            "total_water_saved_liters": round(row["total_water"] or 0, 2),
            "batch_count": row["batch_count"],
        }
        for row in by_month
    ]

    return Response({
        "material_breakdown": material_breakdown,
        "monthly_trend": monthly_trend,
    })
@api_view(['GET'])
def category_breakdown(request):
    """
    Breaks down batches by waste_category (Recyclable, Reusable,
    Hazardous Textile Waste, etc.) with counts and total quantity.
    """
    breakdown = (
        TextileWaste.objects.exclude(waste_category__isnull=True)
        .values('waste_category')
        .annotate(
            batch_count=Count('id'),
            total_quantity=Sum('quantity'),
        )
        .order_by('-total_quantity')
    )

    result = [
        {
            "waste_category": row["waste_category"],
            "batch_count": row["batch_count"],
            "total_quantity_kg": round(row["total_quantity"] or 0, 2),
        }
        for row in breakdown
    ]

    return Response({"category_breakdown": result})


@api_view(['GET'])
def material_recovery(request):
    """
    Per-material recovery rate: how much of each material type
    has reached 'Processed' status vs total registered.
    """
    materials = TextileWaste.objects.values_list('material_type', flat=True).distinct()
    result = []

    for material in materials:
        batches = TextileWaste.objects.filter(material_type=material)
        total_qty = batches.aggregate(total=Sum('quantity'))['total'] or 0
        processed_qty = batches.filter(status='Processed').aggregate(
            total=Sum('quantity'))['total'] or 0
        recovery_rate = (processed_qty / total_qty * 100) if total_qty else 0

        result.append({
            "material": material,
            "total_quantity_kg": round(total_qty, 2),
            "processed_quantity_kg": round(processed_qty, 2),
            "recovery_rate_percent": round(recovery_rate, 2),
        })

    return Response({"material_recovery": result})
