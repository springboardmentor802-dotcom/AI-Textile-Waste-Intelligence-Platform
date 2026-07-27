from app.models.waste_classification import WasteClassification


class RecommendationService:
    """
    Generates recycling and sustainability recommendations
    based on waste classification results.
    """

    def generate(self, waste: WasteClassification) -> dict:

        recommendation = {
            "recommended_action": "",
            "priority": "",
            "estimated_recovery": "",
            "environmental_impact": "",
        }

        if waste.recyclable:

            recommendation["priority"] = "High"

            if waste.recommended_recycling_method == "Mechanical Recycling":

                recommendation["recommended_action"] = (
                    "Send to a mechanical textile recycling facility."
                )

                recommendation["estimated_recovery"] = (
                    "Recover fibres for reuse in new textile products."
                )

            elif waste.recommended_recycling_method == "Chemical Recycling":

                recommendation["recommended_action"] = (
                    "Process using chemical recycling."
                )

                recommendation["estimated_recovery"] = (
                    "Recover polymer fibres for manufacturing."
                )

            elif waste.recommended_recycling_method == "Upcycling":

                recommendation["recommended_action"] = (
                    "Use for upcycled garments or accessories."
                )

                recommendation["estimated_recovery"] = (
                    "High-value product recovery."
                )

            else:

                recommendation["recommended_action"] = (
                    "Send for appropriate recycling."
                )

                recommendation["estimated_recovery"] = (
                    "Material recovery possible."
                )

        else:

            recommendation["priority"] = "Medium"

            recommendation["recommended_action"] = (
                waste.disposal_method or
                "Dispose according to environmental regulations."
            )

            recommendation["estimated_recovery"] = (
                "Recovery not economically feasible."
            )

        if waste.sustainability_score >= 90:

            recommendation["environmental_impact"] = (
                "Excellent sustainability potential."
            )

        elif waste.sustainability_score >= 75:

            recommendation["environmental_impact"] = (
                "Good sustainability potential."
            )

        elif waste.sustainability_score >= 60:

            recommendation["environmental_impact"] = (
                "Moderate sustainability potential."
            )

        else:

            recommendation["environmental_impact"] = (
                "Low sustainability potential."
            )

        return recommendation


recommendation_service = RecommendationService()