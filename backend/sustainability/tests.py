from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.test import TestCase
from django.contrib.auth.models import User
from inventory.models import TextileWaste
from .services import calculate_environmental_impact, recommend_strategy
from .models import ImpactRecord


class SustainabilityServicesTestCase(TestCase):
    """
    Unit tests for the core calculation functions in services.py.
    These don't touch the database at all -- pure function tests.
    """

    def test_environmental_impact_known_material(self):
        """Cotton at 100% circularity should return a known, non-zero result."""
        result = calculate_environmental_impact("Cotton", 100, 100)
        self.assertGreater(result["co2_saved_kg"], 0)
        self.assertGreater(result["water_saved_liters"], 0)

    def test_environmental_impact_unknown_material_uses_default(self):
        """An unrecognized material should still return a result via the default factor."""
        result = calculate_environmental_impact("UnknownFabric", 50, 80)
        self.assertGreater(result["co2_saved_kg"], 0)

    def test_environmental_impact_zero_quantity(self):
        """Zero quantity should always produce zero impact, regardless of material."""
        result = calculate_environmental_impact("Cotton", 0, 100)
        self.assertEqual(result["co2_saved_kg"], 0)
        self.assertEqual(result["water_saved_liters"], 0)

    def test_recommend_strategy_contaminated_overrides_everything(self):
        """Contamination should always win, even with a high circularity score."""
        strategy = recommend_strategy(
            circularity_score=90, condition="Contaminated", contamination=True)
        self.assertIn("Chemical Recycling", strategy)

    def test_recommend_strategy_high_score(self):
        strategy = recommend_strategy(
            circularity_score=85, condition="Lightly Used", contamination=False)
        self.assertEqual(strategy, "Fabric Reuse / Donation")

    def test_recommend_strategy_moderate_score(self):
        strategy = recommend_strategy(
            circularity_score=50, condition="Worn", contamination=False)
        self.assertEqual(strategy, "Upcycling")


class ImpactRecordSignalTestCase(TestCase):
    """
    Tests the Django signal that auto-creates an ImpactRecord whenever
    a TextileWaste batch is saved.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="tester", password="testpass123")

    def test_impact_record_created_on_batch_save(self):
        """Saving a new TextileWaste batch should automatically create an ImpactRecord."""
        batch = TextileWaste.objects.create(
            material_type="Cotton",
            quantity=50,
            color="Blue",
            source="Test Factory",
            condition="Lightly Used",
            created_by=self.user,
        )
        self.assertTrue(ImpactRecord.objects.filter(
            waste_batch=batch).exists())

    def test_impact_record_uses_real_circularity_score_when_present(self):
        """If a batch already has a real AI-generated circularity_score, the
        signal should use it directly instead of falling back to a placeholder."""
        batch = TextileWaste.objects.create(
            material_type="Cotton",
            quantity=50,
            color="Blue",
            source="Test Factory",
            condition="Lightly Used",
            circularity_score=77.5,
            created_by=self.user,
        )
        impact = ImpactRecord.objects.get(waste_batch=batch)
        self.assertEqual(impact.circularity_score, 77.5)

    def test_impact_record_uses_placeholder_when_score_missing(self):
        """If circularity_score is None (not yet AI-analyzed), the signal
        should fall back to the placeholder value."""
        batch = TextileWaste.objects.create(
            material_type="Wool",
            quantity=20,
            color="Red",
            source="Test Factory",
            condition="Worn",
            created_by=self.user,
        )
        impact = ImpactRecord.objects.get(waste_batch=batch)
        self.assertIsNotNone(impact.circularity_score)


class SustainabilityAPITestCase(APITestCase):
    """
    Tests the actual REST API endpoints, simulating a real authenticated
    request the way your frontend does.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="apitester", password="testpass123")
        token = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

        TextileWaste.objects.create(
            material_type="Cotton",
            quantity=100,
            color="Green",
            source="Factory A",
            condition="Lightly Used",
            status="Processed",
            circularity_score=80,
            created_by=self.user,
        )

    def test_summary_endpoint_returns_200(self):
        response = self.client.get("/api/sustainability/summary/")
        self.assertEqual(response.status_code, 200)

    def test_summary_endpoint_has_expected_keys(self):
        response = self.client.get("/api/sustainability/summary/")
        expected_keys = {
            "total_co2_saved_kg", "total_water_saved_liters",
            "average_circularity_score", "total_batches",
            "processed_batches", "waste_diversion_rate_percent",
        }
        self.assertTrue(expected_keys.issubset(response.data.keys()))

    def test_summary_reflects_processed_batch(self):
        response = self.client.get("/api/sustainability/summary/")
        self.assertEqual(response.data["processed_batches"], 1)
        self.assertEqual(response.data["waste_diversion_rate_percent"], 100.0)
