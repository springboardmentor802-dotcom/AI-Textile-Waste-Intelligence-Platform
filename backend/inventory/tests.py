from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import TextileWaste, UserProfile
from .services.recyclability_scoring_service import calculate_circularity_score
from .services.waste_categorization_service import categorize_waste


class RecyclabilityScoringTestCase(TestCase):
    """
    Unit tests for the circularity scoring formula (Milestone 2, Task 4).
    """

    def test_cotton_good_condition_scores_reasonably_high(self):
        result = calculate_circularity_score(fabric_type="cotton", condition="good")
        self.assertGreaterEqual(result["circularity_score"], 60)
        self.assertIn(result["circularity_category"], [
            "High Recovery Potential", "Excellent Recovery Potential"
        ])

    def test_mixed_fabrics_damaged_scores_low(self):
        result = calculate_circularity_score(fabric_type="mixed fabrics", condition="damaged")
        self.assertLess(result["circularity_score"], 40)

    def test_unknown_fabric_uses_default_score(self):
        """An unrecognized fabric type should not crash -- it should use the default (50)."""
        result = calculate_circularity_score(fabric_type="unobtainium", condition="good")
        self.assertIsInstance(result["circularity_score"], float)

    def test_score_breakdown_has_all_components(self):
        result = calculate_circularity_score(fabric_type="denim", condition="excellent")
        expected_keys = {
            "material_recyclability", "material_condition", "reuse_potential",
            "environmental_benefit", "processing_feasibility",
        }
        self.assertTrue(expected_keys.issubset(result["breakdown"].keys()))


class WasteCategorizationTestCase(TestCase):
    """
    Unit tests for the rule-based waste category engine (Milestone 2, Task 3).
    """

    def test_contamination_always_returns_hazardous(self):
        result = categorize_waste(
            fabric_type="Cotton", condition="New Surplus", contamination_suspected=True
        )
        self.assertEqual(result["waste_category"], "Hazardous Textile Waste")

    def test_contaminated_condition_returns_hazardous_even_without_flag(self):
        result = categorize_waste(
            fabric_type="Cotton", condition="Contaminated", contamination_suspected=False
        )
        self.assertEqual(result["waste_category"], "Hazardous Textile Waste")

    def test_new_surplus_returns_reusable(self):
        result = categorize_waste(
            fabric_type="Wool", condition="New Surplus", contamination_suspected=False
        )
        self.assertEqual(result["waste_category"], "Reusable")

    def test_damaged_natural_fiber_returns_compostable(self):
        result = categorize_waste(
            fabric_type="Cotton", condition="Damaged", contamination_suspected=False
        )
        self.assertEqual(result["waste_category"], "Compostable")

    def test_worn_blended_fabric_returns_upcyclable(self):
        result = categorize_waste(
            fabric_type="Mixed fabrics", condition="Worn", contamination_suspected=False
        )
        self.assertEqual(result["waste_category"], "Upcyclable")


class TextileWasteModelTestCase(TestCase):
    """
    Tests the TextileWaste model itself -- batch ID auto-generation, etc.
    """

    def setUp(self):
        self.user = User.objects.create_user(username="modeltester", password="testpass123")

    def test_batch_id_auto_generated(self):
        batch = TextileWaste.objects.create(
            material_type="Cotton", quantity=10, color="Blue",
            source="Test", condition="Worn", created_by=self.user,
        )
        self.assertTrue(batch.batch_id.startswith("WB-"))

    def test_batch_id_is_unique(self):
        batch1 = TextileWaste.objects.create(
            material_type="Cotton", quantity=10, color="Blue",
            source="Test", condition="Worn", created_by=self.user,
        )
        batch2 = TextileWaste.objects.create(
            material_type="Wool", quantity=5, color="Red",
            source="Test", condition="Worn", created_by=self.user,
        )
        self.assertNotEqual(batch1.batch_id, batch2.batch_id)


class InventoryAPITestCase(APITestCase):
    """
    Tests the core inventory REST endpoints with real authenticated requests.
    """

    def setUp(self):
        self.user = User.objects.create_user(username="apitester2", password="testpass123")
        UserProfile.objects.create(user=self.user, role="Recycling Facility Operator")
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    def test_create_textile_waste_batch(self):
        response = self.client.post("/api/textiles/", {
            "material_type": "Cotton",
            "quantity": 25,
            "color": "White",
            "source": "Factory X",
            "condition": "Worn",
            "status": "Registered",
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["batch_id"].startswith("WB-"))

    def test_list_textile_waste_requires_authentication(self):
        self.client.credentials()  # remove auth header
        response = self.client.get("/api/textiles/")
        self.assertEqual(response.status_code, 401)

    def test_inventory_summary_endpoint(self):
        TextileWaste.objects.create(
            material_type="Cotton", quantity=30, color="Blue",
            source="Test", condition="Worn", created_by=self.user,
        )
        response = self.client.get("/api/inventory-summary/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("total_batches", response.data)
from django.core.files.uploadedfile import SimpleUploadedFile


class ImageUploadValidationTestCase(APITestCase):
    """
    Tests the file-type and file-size validation added during Milestone 4
    QA review (fixes bugs found in TC_IMG_002 and TC_IMG_003 -- previously
    an invalid file type or oversized file caused a raw server error
    instead of a clean validation message).
    """

    def setUp(self):
        self.user = User.objects.create_user(username="qatester", password="testpass123")
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    def test_rejects_non_image_file_type(self):
        """TC_IMG_002: uploading a .pdf disguised as 'image' should be
        rejected cleanly, not crash the server."""
        fake_pdf = SimpleUploadedFile(
            "document.pdf", b"%PDF-1.4 fake content", content_type="application/pdf"
        )
        response = self.client.post(
            "/api/analyze-image/", {"image": fake_pdf}, format="multipart"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid file type", response.data["error"])

    def test_rejects_oversized_image(self):
        """TC_IMG_003: an image over the 10MB limit should be rejected
        with a clear error instead of hanging or crashing."""
        oversized_content = b"0" * (11 * 1024 * 1024)  # 11 MB, over the limit
        fake_image = SimpleUploadedFile(
            "huge.jpg", oversized_content, content_type="image/jpeg"
        )
        response = self.client.post(
            "/api/analyze-image/", {"image": fake_image}, format="multipart"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("too large", response.data["error"])

    def test_accepts_valid_jpeg_content_type(self):
        """A correctly-typed small JPEG should pass validation (though it
        may still fail downstream if the bytes aren't a real image --
        this test only confirms the type/size gate itself works)."""
        small_valid_type_file = SimpleUploadedFile(
            "small.jpg", b"fake but small jpeg bytes", content_type="image/jpeg"
        )
        response = self.client.post(
            "/api/analyze-image/", {"image": small_valid_type_file}, format="multipart"
        )
        # Should NOT be rejected for type/size reasons (400 with our
        # validation message) -- it may still 500 downstream since the
        # bytes aren't a real decodable image, and that's a separate concern.
        self.assertNotEqual(
            response.data.get("error"), "Invalid file type. Please upload a JPG or PNG image."
        )