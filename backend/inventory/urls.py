from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TextileWasteViewSet,
    RegisterView,
    MeView,
    InventorySummaryView,
    ImageAnalysisView,
    MaterialClassificationView,
    WasteCategorizationView,
    RecyclabilityAssessmentView,
    WasteReportView,
    WasteReportPDFView,
    BatchWasteReportPDFView,
    AnalyzeAndLinkToBatchView,
)

router = DefaultRouter()
router.register(r'textiles', TextileWasteViewSet, basename='textiles')

urlpatterns = [
    path('', include(router.urls)),

    # Register API
    path('register/', RegisterView.as_view(), name='register'),

    # Current user info (username + role)
    path('me/', MeView.as_view(), name='me'),

    # Inventory monitoring: aggregate summary stats
    path('inventory-summary/', InventorySummaryView.as_view(),
         name='inventory-summary'),

    # Textile Image Analysis Engine (Milestone 2, Task 1)
    path('analyze-image/', ImageAnalysisView.as_view(),
         name='analyze-image'),

    # Material Classification Engine (Milestone 2, Task 2)
    path('classify-material/', MaterialClassificationView.as_view(),
         name='classify-material'),

    # Textile Waste Classification Engine (Milestone 2, Task 3)
    path('categorize-waste/', WasteCategorizationView.as_view(),
         name='categorize-waste'),

    # Recyclability Assessment Engine (Milestone 2, Task 4)
    path('assess-recyclability/', RecyclabilityAssessmentView.as_view(),
         name='assess-recyclability'),

    # Combined Waste Classification Report (Milestone 2, Task 5)
    path('waste-report/', WasteReportView.as_view(),
         name='waste-report'),

    # Downloadable PDF version of the combined report
    path('waste-report-pdf/', WasteReportPDFView.as_view(),
         name='waste-report-pdf'),

    # Batch analysis: multiple images -> one combined PDF
    path('batch-waste-report-pdf/', BatchWasteReportPDFView.as_view(),
         name='batch-waste-report-pdf'),

    # Milestone 3 link: analyze an image and save results onto a specific batch
    path('analyze-and-link/<str:batch_id>/', AnalyzeAndLinkToBatchView.as_view(),
         name='analyze-and-link'),
]
