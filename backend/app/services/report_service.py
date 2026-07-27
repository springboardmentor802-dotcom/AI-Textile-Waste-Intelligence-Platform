import os
from datetime import datetime

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph
from sqlalchemy.orm import Session, joinedload

from app.models.textile_waste import TextileWaste
from app.services.recommendation_service import recommendation_service


class ReportService:
    """
    Service responsible for generating analysis reports.
    """

    REPORT_DIRECTORY = "reports"

    def __init__(self):
        os.makedirs(self.REPORT_DIRECTORY, exist_ok=True)

    def generate_report(
        self,
        db: Session,
        analysis_id: int,
        current_user_id: int,
    ) -> str:
        """
        Generate PDF report for a textile analysis.
        """

        textile = (
            db.query(TextileWaste)
            .options(
                joinedload(TextileWaste.material_classification),
                joinedload(TextileWaste.waste_classification),
            )
            .filter(
                TextileWaste.id == analysis_id,
                TextileWaste.uploaded_by == current_user_id,
            )
            .first()
        )

        if textile is None:
            raise ValueError("Analysis not found.")

        filename = f"analysis_{analysis_id}.pdf"

        report_path = os.path.join(
            self.REPORT_DIRECTORY,
            filename,
        )

        doc = SimpleDocTemplate(report_path)

        styles = getSampleStyleSheet()
        story = []

        # ----------------------------------------------------
        # Title
        # ----------------------------------------------------

        story.append(
            Paragraph(
                "<b>TEXTILE WASTE ANALYSIS REPORT</b>",
                styles["Title"],
            )
        )

        story.append(
            Paragraph(
                f"Generated: {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}",
                styles["Normal"],
            )
        )

        # ----------------------------------------------------
        # Textile Details
        # ----------------------------------------------------

        story.append(
            Paragraph(
                "<br/><b>TEXTILE DETAILS</b>",
                styles["Heading2"],
            )
        )

        story.append(
            Paragraph(
                f"Textile Name: {textile.textile_name}",
                styles["Normal"],
            )
        )

        story.append(
            Paragraph(
                f"Description: {textile.description or 'N/A'}",
                styles["Normal"],
            )
        )

        story.append(
            Paragraph(
                f"Analysis Status: {textile.analysis_status}",
                styles["Normal"],
            )
        )

        # ----------------------------------------------------
        # Material Classification
        # ----------------------------------------------------

        if textile.material_classification:

            material = textile.material_classification

            story.append(
                Paragraph(
                    "<br/><b>MATERIAL CLASSIFICATION</b>",
                    styles["Heading2"],
                )
            )

            story.append(
                Paragraph(
                    f"Predicted Material: {material.predicted_material}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Confidence Score: {material.confidence_score}%",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Material Type: {material.material_type}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Fibre Composition: {material.fibre_composition}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Model: {material.model_name} ({material.model_version})",
                    styles["Normal"],
                )
            )

        # ----------------------------------------------------
        # Waste Classification
        # ----------------------------------------------------

        recommendation = None

        if textile.waste_classification:

            waste = textile.waste_classification

            story.append(
                Paragraph(
                    "<br/><b>WASTE CLASSIFICATION</b>",
                    styles["Heading2"],
                )
            )

            story.append(
                Paragraph(
                    f"Waste Category: {waste.waste_category}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Waste Condition: {waste.waste_condition}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Recyclability Score: {waste.recyclability_score}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Recyclable: {'Yes' if waste.recyclable else 'No'}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Recommended Recycling Method: {waste.recommended_recycling_method}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Disposal Method: {waste.disposal_method}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Carbon Saving Estimate: {waste.carbon_saving_estimate} kg CO₂",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Sustainability Score: {waste.sustainability_score}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Remarks: {waste.remarks}",
                    styles["Normal"],
                )
            )

            recommendation = recommendation_service.generate(waste)

        # ----------------------------------------------------
        # Recommendations
        # ----------------------------------------------------

        if recommendation:

            story.append(
                Paragraph(
                    "<br/><b>AI RECOMMENDATIONS</b>",
                    styles["Heading2"],
                )
            )

            story.append(
                Paragraph(
                    f"Recommended Action: {recommendation['recommended_action']}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Priority: {recommendation['priority']}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Estimated Recovery: {recommendation['estimated_recovery']}",
                    styles["Normal"],
                )
            )

            story.append(
                Paragraph(
                    f"Environmental Impact: {recommendation['environmental_impact']}",
                    styles["Normal"],
                )
            )

        doc.build(story)

        return report_path


report_service = ReportService()