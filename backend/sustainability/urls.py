from django.urls import path
from .views import (
    sustainability_summary,
    sustainability_trends,
    category_breakdown,
    material_recovery,
)

urlpatterns = [
    path('summary/', sustainability_summary, name='sustainability-summary'),
    path('trends/', sustainability_trends, name='sustainability-trends'),
    path('category-breakdown/', category_breakdown, name='category-breakdown'),
    path('material-recovery/', material_recovery, name='material-recovery'),
]