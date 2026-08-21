from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
import tempfile
import os

from .models import TextileWaste, Notification
from .serializers import TextileWasteSerializer, RegisterSerializer
from .permissions import IsRecyclingOperatorOrAdmin, get_user_role
from .services.image_analysis_service import analyze_textile_image
from .services.waste_categorization_service import categorize_waste
from .services.recyclability_scoring_service import calculate_circularity_score
from .services.material_classification_service import predict_fabric_type
from .services.recommendation_service import recommend_action
from .services.environmental_impact_service import estimate_environmental_impact
from .services.sustainability_service import build_sustainability_summary
from .services.pdf_report_service import (
    generate_waste_report_pdf,
    generate_batch_waste_report_pdf,
)
from .services.excel_report_service import (
    generate_waste_report_excel,
    generate_inventory_excel,
)


ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def validate_image_file(uploaded_file):
    """
    Returns an error message string if invalid, or None if valid.
    Fixes bugs found during Milestone 4 QA review (TC_IMG_002, TC_IMG_003):
    previously a wrong file type or an oversized file caused an
    unhandled crash instead of a clean validation error.
    """
    if uploaded_file.content_type not in ALLOWED_IMAGE_TYPES:
        return "Invalid file type. Please upload a JPG or PNG image."
    if uploaded_file.size > MAX_IMAGE_SIZE_BYTES:
        return "File too large. Maximum allowed size is 10MB."
    return None


class TextileWasteViewSet(viewsets.ModelViewSet):
    serializer_class = TextileWasteSerializer
    permission_classes = [IsAuthenticated, IsRecyclingOperatorOrAdmin]

    def get_queryset(self):
        """
        Waste source tracking + batch/collection filtering:
        supports ?material=, ?source=, ?status=, ?condition= query params.
        """
        queryset = TextileWaste.objects.all().order_by('-date_added')

        material = self.request.query_params.get('material')
        source = self.request.query_params.get('source')
        status_param = self.request.query_params.get('status')
        condition = self.request.query_params.get('condition')

        if material:
            queryset = queryset.filter(material_type=material)
        if source:
            queryset = queryset.filter(source__icontains=source)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if condition:
            queryset = queryset.filter(condition=condition)

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "role": get_user_role(request.user),
        })


class InventorySummaryView(APIView):
    """
    Inventory monitoring: aggregate totals for the dashboard --
    total batches, total quantity, and breakdowns by material type
    and status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_batches = TextileWaste.objects.all()

        total_batches = all_batches.count()
        total_quantity = all_batches.aggregate(
            total=Sum('quantity'))['total'] or 0

        by_material = list(
            all_batches.values('material_type')
            .annotate(quantity=Sum('quantity'), count=Count('id'))
            .order_by('-quantity')
        )

        by_status = list(
            all_batches.values('condition')
            .annotate(quantity=Sum('quantity'), count=Count('id'))
            .order_by('-quantity')
        )

        by_source = list(
            all_batches.values('source')
            .annotate(quantity=Sum('quantity'), count=Count('id'))
            .order_by('-quantity')
        )

        return Response({
            "total_batches": total_batches,
            "total_quantity": total_quantity,
            "by_material": by_material,
            "by_status": by_status,
            "by_source": by_source,
        })


class ImageAnalysisView(APIView):
    """
    Textile Image Analysis Engine endpoint.

    Accepts an uploaded image (multipart/form-data, field name 'image')
    and returns basic visual analysis: image dimensions, average color,
    brightness, texture complexity, and a simple contamination/damage
    heuristic check.

    This is Milestone 2, Task 1 -- it does NOT predict fabric type.
    Fabric/fiber type prediction (using a trained PyTorch model) is a
    separate service built in Task 2.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('image')

        if not uploaded_file:
            return Response(
                {"error": "No image file provided. Send it as 'image' in form-data."},
                status=400
            )

        validation_error = validate_image_file(uploaded_file)
        if validation_error:
            return Response({"error": validation_error}, status=400)

        # Save the uploaded image to a temporary file so OpenCV can read it
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            result = analyze_textile_image(temp_file_path)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            # Clean up the temporary file afterwards, regardless of outcome
            os.remove(temp_file_path)

        return Response(result)


class MaterialClassificationView(APIView):
    """
    Material Classification Engine endpoint (Milestone 2, Task 2).

    Accepts an uploaded image (multipart/form-data, field name 'image')
    and returns the predicted fiber type using the trained PyTorch CNN,
    along with a confidence score.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('image')

        if not uploaded_file:
            return Response(
                {"error": "No image file provided. Send it as 'image' in form-data."},
                status=400
            )

        validation_error = validate_image_file(uploaded_file)
        if validation_error:
            return Response({"error": validation_error}, status=400)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            result = predict_fabric_type(temp_file_path)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            os.remove(temp_file_path)

        return Response(result)


class WasteCategorizationView(APIView):
    """
    Textile Waste Classification Engine endpoint (Milestone 2, Task 3).

    Accepts fabric_type, condition, and an optional contamination_suspected
    flag, and returns the predicted waste category (Recyclable, Reusable,
    Repairable, Upcyclable, Compostable, or Hazardous Textile Waste) along
    with a short reason explaining the decision.

    This uses rule-based logic, not a trained model, since no dataset
    directly labels items with these exact 6 categories.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fabric_type = request.data.get('fabric_type')
        condition = request.data.get('condition')
        contamination_suspected = request.data.get(
            'contamination_suspected', False)

        if not fabric_type or not condition:
            return Response(
                {"error": "Both 'fabric_type' and 'condition' are required."},
                status=400
            )

        result = categorize_waste(
            fabric_type=fabric_type,
            condition=condition,
            contamination_suspected=contamination_suspected,
        )

        return Response(result)


class RecyclabilityAssessmentView(APIView):
    """
    Recyclability Assessment Engine endpoint (Milestone 2, Task 4).
    Accepts fabric_type and condition, returns the circularity score,
    category, and a breakdown of sub-scores.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fabric_type = request.data.get('fabric_type')
        condition = request.data.get('condition')

        if not fabric_type or not condition:
            return Response(
                {"error": "Both 'fabric_type' and 'condition' are required."},
                status=400
            )

        result = calculate_circularity_score(
            fabric_type=fabric_type,
            condition=condition,
        )

        return Response(result)


class RecommendationView(APIView):
    """
    Recycling Recommendation Engine endpoint (Milestone 3, Task 1).

    Accepts fabric_type, condition, and waste_category, and returns a
    recommended recycling/reuse action (one of the 7 recycling options
    from the spec), a plain-language reason, and upcycling ideas when
    relevant.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fabric_type = request.data.get('fabric_type')
        condition = request.data.get('condition')
        waste_category = request.data.get('waste_category')

        if not fabric_type or not condition or not waste_category:
            return Response(
                {"error": "'fabric_type', 'condition', and 'waste_category' are required."},
                status=400
            )

        result = recommend_action(
            fabric_type=fabric_type,
            condition=condition,
            waste_category=waste_category,
        )

        return Response(result)


class EnvironmentalImpactView(APIView):
    """
    Environmental Impact Assessment Engine endpoint (Milestone 3, Task 2).

    Accepts fabric_type, quantity (kg), and an optional waste_category,
    and returns estimated CO2 saved, water saved, and landfill diverted.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fabric_type = request.data.get('fabric_type')
        quantity = request.data.get('quantity')
        waste_category = request.data.get('waste_category')

        if not fabric_type or quantity is None:
            return Response(
                {"error": "'fabric_type' and 'quantity' are required."},
                status=400
            )

        try:
            quantity = float(quantity)
        except (TypeError, ValueError):
            return Response({"error": "'quantity' must be a number."}, status=400)

        result = estimate_environmental_impact(
            fabric_type=fabric_type,
            quantity_kg=quantity,
            waste_category=waste_category,
        )

        return Response(result)


class SustainabilitySummaryView(APIView):
    """
    Sustainability Intelligence Engine endpoint (Milestone 3, Task 3).

    Aggregates across the ENTIRE inventory (not a single item) to
    produce fleet-level metrics: total quantity, waste diversion rate,
    total environmental impact, a circular-economy category breakdown,
    and an overall sustainability score. Powers the Sustainability
    dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_batches = TextileWaste.objects.all()
        summary = build_sustainability_summary(all_batches)
        return Response(summary)


def _run_full_pipeline(temp_file_path, condition):
    """
    Shared helper: runs all engines in sequence and returns the
    combined report dictionary. Used by both WasteReportView (JSON)
    and WasteReportPDFView (PDF), to avoid duplicating this logic.

    Milestone 3 update: now also runs the recommendation engine and
    environmental impact engine, chained off the waste category and
    fabric type produced by the Milestone 2 engines.
    """
    image_analysis = analyze_textile_image(temp_file_path)
    contamination_suspected = image_analysis[
        "damage_contamination_check"]["contamination_suspected"]

    material_prediction = predict_fabric_type(temp_file_path)
    fabric_type = material_prediction["predicted_fiber_type"]

    waste_category_result = categorize_waste(
        fabric_type=fabric_type,
        condition=condition,
        contamination_suspected=contamination_suspected,
    )

    recyclability_result = calculate_circularity_score(
        fabric_type=fabric_type,
        condition=condition,
    )

    recommendation_result = recommend_action(
        fabric_type=fabric_type,
        condition=condition,
        waste_category=waste_category_result.get("waste_category"),
    )

    return {
        "image_analysis": image_analysis,
        "material_classification": material_prediction,
        "waste_categorization": waste_category_result,
        "recyclability_assessment": recyclability_result,
        "recommendation": recommendation_result,
    }


class WasteReportView(APIView):
    """
    Combined Waste Classification Report endpoint (Milestone 2, Task 5;
    extended in Milestone 3 with recommendation output).

    Accepts an uploaded image plus a 'condition' field, and returns a
    single combined JSON report chaining all engines together:
      1. Image analysis (color, texture, contamination check)
      2. Material classification (predicted fiber type via PyTorch)
      3. Waste categorization (rule-based waste category)
      4. Recyclability assessment (circularity score)
      5. Recycling recommendation (Milestone 3)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('image')
        condition = request.data.get('condition')

        if not uploaded_file or not condition:
            return Response(
                {"error": "Both an 'image' file and 'condition' are required."},
                status=400
            )

        validation_error = validate_image_file(uploaded_file)
        if validation_error:
            return Response({"error": validation_error}, status=400)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            report_data = _run_full_pipeline(temp_file_path, condition)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            os.remove(temp_file_path)

        return Response(report_data)


class WasteReportPDFView(APIView):
    """
    Downloadable PDF version of the Combined Waste Classification Report.

    Same inputs as WasteReportView (image + condition), but returns a
    PDF file as an attachment instead of JSON. Fulfills the spec's
    "PDF export" requirement under Reports & Export System.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('image')
        condition = request.data.get('condition')

        if not uploaded_file or not condition:
            return Response(
                {"error": "Both an 'image' file and 'condition' are required."},
                status=400
            )

        validation_error = validate_image_file(uploaded_file)
        if validation_error:
            return Response({"error": validation_error}, status=400)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            report_data = _run_full_pipeline(temp_file_path, condition)
            pdf_buffer = generate_waste_report_pdf(report_data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            os.remove(temp_file_path)

        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="waste_report.pdf"'
        return response


class WasteReportExcelView(APIView):
    """
    Downloadable Excel version of the Combined Waste Classification Report.

    Same inputs as WasteReportView (image + condition), but returns an
    .xlsx file as an attachment instead of JSON. Fulfills the spec's
    "Excel export" requirement under Reports & Export System.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('image')
        condition = request.data.get('condition')

        if not uploaded_file or not condition:
            return Response(
                {"error": "Both an 'image' file and 'condition' are required."},
                status=400
            )

        validation_error = validate_image_file(uploaded_file)
        if validation_error:
            return Response({"error": validation_error}, status=400)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            report_data = _run_full_pipeline(temp_file_path, condition)
            excel_buffer = generate_waste_report_excel(report_data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            os.remove(temp_file_path)

        response = HttpResponse(
            excel_buffer,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="waste_report.xlsx"'
        return response


class InventoryExcelExportView(APIView):
    """
    Full inventory export as Excel: every TextileWaste batch currently
    in the system, one row per batch. Fulfills the spec's Reports &
    Export System requirement for a facility-wide Excel export.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_batches = TextileWaste.objects.all().order_by('-date_added')

        try:
            excel_buffer = generate_inventory_excel(all_batches)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        response = HttpResponse(
            excel_buffer,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="inventory_export.xlsx"'
        return response


class BatchWasteReportPDFView(APIView):
    """
    Batch analysis endpoint (Milestone 2 extension).

    Accepts MULTIPLE images (field name 'images', sent repeated in
    form-data) plus a single 'condition' value applied to all of them,
    runs the full engine pipeline on each image, and returns ONE
    combined, shareable PDF: a summary table followed by one detailed
    section per image.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_files = request.FILES.getlist('images')
        condition = request.data.get('condition')

        if not uploaded_files:
            return Response(
                {"error": "At least one image is required under the 'images' field."},
                status=400
            )
        if not condition:
            return Response({"error": "'condition' is required."}, status=400)

        for uploaded_file in uploaded_files:
            validation_error = validate_image_file(uploaded_file)
            if validation_error:
                return Response(
                    {"error": f"{uploaded_file.name}: {validation_error}"},
                    status=400
                )

        reports = []
        temp_paths = []

        try:
            for uploaded_file in uploaded_files:
                with tempfile.NamedTemporaryFile(
                    delete=False, suffix='.jpg'
                ) as temp_file:
                    for chunk in uploaded_file.chunks():
                        temp_file.write(chunk)
                    temp_file_path = temp_file.name
                    temp_paths.append(temp_file_path)

                report_data = _run_full_pipeline(temp_file_path, condition)
                reports.append({
                    "filename": uploaded_file.name,
                    "report_data": report_data,
                })

            pdf_buffer = generate_batch_waste_report_pdf(reports)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            for path in temp_paths:
                if os.path.exists(path):
                    os.remove(path)

        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="batch_waste_report.pdf"'
        return response


class AnalyzeAndLinkToBatchView(APIView):
    """
    Runs the full pipeline on an uploaded image and saves the resulting
    material type, circularity score, and waste category directly onto
    an existing TextileWaste batch (identified by batch_id). This is
    what allows the Sustainability Intelligence Engine to use real
    AI-generated scores instead of placeholder values.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, batch_id):
        uploaded_file = request.FILES.get('image')

        if not uploaded_file:
            return Response(
                {"error": "No image file provided. Send it as 'image' in form-data."},
                status=400
            )

        validation_error = validate_image_file(uploaded_file)
        if validation_error:
            return Response({"error": validation_error}, status=400)

        try:
            batch = TextileWaste.objects.get(batch_id=batch_id)
        except TextileWaste.DoesNotExist:
            return Response({"error": "Batch not found."}, status=404)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            report_data = _run_full_pipeline(temp_file_path, batch.condition)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            os.remove(temp_file_path)

        batch.detected_material = report_data["material_classification"]["predicted_fiber_type"]
        batch.circularity_score = report_data["recyclability_assessment"]["circularity_score"]
        batch.waste_category = report_data["waste_categorization"]["waste_category"]
        batch.save()

        return Response({
            "message": f"Batch {batch_id} updated with AI analysis.",
            "detected_material": batch.detected_material,
            "circularity_score": batch.circularity_score,
            "waste_category": batch.waste_category,
        })


class NotificationListView(APIView):
    """
    Returns the current user's notifications, most recent first
    (matches the Notification model's default ordering). Powers the
    notification bell dropdown on the dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        data = [
            {
                "id": n.id,
                "notification_type": n.notification_type,
                "message": n.message,
                "related_batch": n.related_batch.batch_id if n.related_batch else None,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in notifications
        ]
        return Response(data)


class NotificationMarkReadView(APIView):
    """
    Marks a single notification as read. Matches the dashboard's
    PATCH notifications/{id}/ call when a notification is clicked.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(
            Notification, pk=pk, user=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({
            "id": notification.id,
            "is_read": notification.is_read,
        })


class NotificationUnreadCountView(APIView):
    """
    Returns just the unread count for the current user, for the
    notification bell badge.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user, is_read=False
        ).count()
        return Response({"unread_count": count})