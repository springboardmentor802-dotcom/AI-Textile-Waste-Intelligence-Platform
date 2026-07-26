"""
Report Generation Service
Creates structured report data and generates professional PDF reports.
"""

import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


def generate_report_data(pipeline_result: dict, waste_classification: dict) -> dict:
    """
    Assemble a complete structured report from the pipeline and classification outputs.
    """
    material = pipeline_result["material_recognition"]
    defects = pipeline_result["defect_detection"]
    colors = pipeline_result["color_analysis"]
    texture = pipeline_result["texture_analysis"]
    pattern = pipeline_result["pattern_analysis"]
    waste_cat = pipeline_result["waste_categorization"]
    recyclability = pipeline_result["recyclability_assessment"]
    sustainability = pipeline_result["sustainability_intelligence"]
    scores = pipeline_result["waste_scores"]

    return {
        "report_metadata": {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "report_version": "1.0",
            "platform": "AI Textile Waste Intelligence Platform",
        },
        "material_analysis": {
            "material_type": material.get("predicted_material"),
            "material_confidence": material.get("confidence"),
            "all_predictions": material.get("all_predictions", [])[:5],
        },
        "defect_analysis": {
            "detected_defects": defects.get("defects", []),
            "defect_count": defects.get("defect_count"),
            "material_condition": defects.get("condition"),
            "has_defects": defects.get("has_defects"),
        },
        "visual_analysis": {
            "color_analysis": {
                "dominant_colors": colors.get("dominant_colors", []),
                "hex_colors": colors.get("hex_colors", []),
                "primary_color": colors.get("primary_color_hex"),
                "color_category": colors.get("color_category"),
            },
            "texture_analysis": {
                "texture_type": texture.get("texture_type"),
                "texture_detail": texture.get("texture_detail"),
                "contrast": texture.get("contrast"),
                "homogeneity": texture.get("homogeneity"),
                "energy": texture.get("energy"),
                "correlation": texture.get("correlation"),
            },
            "pattern_analysis": {
                "surface_pattern": pattern.get("surface_pattern"),
                "total_lines": pattern.get("total_lines"),
                "vertical_lines": pattern.get("vertical_lines"),
                "horizontal_lines": pattern.get("horizontal_lines"),
                "diagonal_lines": pattern.get("diagonal_lines"),
            },
        },
        "waste_assessment": {
            "waste_category": waste_cat.get("waste_category"),
            "category_justification": waste_cat.get("justification"),
            "waste_category_prediction": waste_classification.get("waste_category_prediction"),
            "recyclability_assessment": waste_classification.get("recyclability_assessment"),
            "contamination_recommendation": waste_classification.get("contamination_reduction_recommendation"),
            "reuse_potential": waste_classification.get("reuse_potential"),
            "reuse_description": waste_classification.get("reuse_potential_description"),
            "disposal_recommendation": waste_classification.get("disposal_recommendation"),
            "final_recommendation": waste_classification.get("final_recommendation"),
        },
        "recycling_recommendations": {
            "primary_strategy": recyclability.get("primary_recycling_strategy"),
            "strategy_description": recyclability.get("strategy_description"),
            "recycling_options": recyclability.get("recycling_options", []),
            "reuse_opportunity": recyclability.get("reuse_opportunity"),
            "upcycling_suggestion": recyclability.get("upcycling_suggestion"),
            "material_recovery": recyclability.get("material_recovery_recommendation"),
            "waste_reduction_strategies": recyclability.get("waste_reduction_strategies", []),
        },
        "sustainability_report": {
            "carbon_footprint": sustainability.get("carbon_footprint_estimation"),
            "water_savings": sustainability.get("water_savings"),
            "waste_diversion": sustainability.get("waste_diversion_analysis"),
            "circular_economy": sustainability.get("circular_economy_analysis"),
            "resource_recovery": sustainability.get("resource_recovery_estimation"),
            "benchmarking": sustainability.get("sustainability_benchmarking"),
        },
        "scores": {
            "recyclability_score": scores.get("recyclability_score"),
            "reuse_score": scores.get("reuse_score"),
            "sustainability_score": scores.get("sustainability_score"),
            "material_recovery_score": scores.get("material_recovery_score"),
            "overall_circularity_score": scores.get("overall_circularity_score"),
            "circularity_category": scores.get("circularity_category"),
            "score_breakdown": scores.get("score_breakdown"),
        },
    }


def generate_pdf_report(report_data: dict, filename: str = "report") -> bytes:
    """
    Generate a professional PDF report from report data.
    Returns raw PDF bytes.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        import io

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )

        styles = getSampleStyleSheet()
        story = []

        # Custom styles
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontSize=20,
            textColor=colors.HexColor("#1d4ed8"),
            spaceAfter=8,
        )
        heading_style = ParagraphStyle(
            "CustomHeading",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=colors.HexColor("#1e3a8a"),
            spaceBefore=14,
            spaceAfter=6,
        )
        normal_style = styles["Normal"]
        normal_style.fontSize = 10
        normal_style.leading = 14

        def section_table(data, col_widths=None):
            """Helper to build a two-column key-value table."""
            if col_widths is None:
                col_widths = [7 * cm, 10 * cm]
            t = Table(data, colWidths=col_widths)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#dbeafe")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]))
            return t

        # Title
        story.append(Paragraph("AI Textile Waste Intelligence Platform", title_style))
        story.append(Paragraph("Textile Waste Analysis Report", heading_style))
        meta = report_data["report_metadata"]
        story.append(Paragraph(
            f"Generated: {meta['generated_at']} | Version: {meta['report_version']}",
            normal_style,
        ))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1d4ed8")))
        story.append(Spacer(1, 0.3 * cm))

        # Section 1: Material Analysis
        story.append(Paragraph("1. Material Recognition", heading_style))
        mat = report_data["material_analysis"]
        story.append(section_table([
            ["Material Type", mat.get("material_type", "—")],
            ["Confidence", f"{mat.get('material_confidence', 0)}%"],
        ]))
        story.append(Spacer(1, 0.3 * cm))

        # Section 2: Defect Analysis
        story.append(Paragraph("2. Defect Detection", heading_style))
        defect = report_data["defect_analysis"]
        story.append(section_table([
            ["Material Condition", defect.get("material_condition", "—")],
            ["Defects Detected", str(defect.get("defect_count", 0))],
            ["Has Defects", "Yes" if defect.get("has_defects") else "No"],
        ]))
        story.append(Spacer(1, 0.3 * cm))

        # Section 3: Visual Analysis
        story.append(Paragraph("3. Visual Analysis", heading_style))
        visual = report_data["visual_analysis"]
        tex = visual["texture_analysis"]
        pat = visual["pattern_analysis"]
        col = visual["color_analysis"]
        story.append(section_table([
            ["Texture Type", tex.get("texture_type", "—")],
            ["Surface Pattern", pat.get("surface_pattern", "—")],
            ["Primary Color", col.get("primary_color", "—")],
            ["Color Category", col.get("color_category", "—")],
            ["Contrast", str(tex.get("contrast", "—"))],
            ["Homogeneity", str(tex.get("homogeneity", "—"))],
        ]))
        story.append(Spacer(1, 0.3 * cm))

        # Section 4: Waste Assessment
        story.append(Paragraph("4. Waste Assessment", heading_style))
        waste = report_data["waste_assessment"]
        story.append(section_table([
            ["Waste Category", waste.get("waste_category", "—")],
            ["Reuse Potential", waste.get("reuse_potential", "—")],
            ["Disposal Recommendation", waste.get("disposal_recommendation", "—")],
            ["Contamination Recommendation", waste.get("contamination_recommendation", "—")],
        ]))
        story.append(Spacer(1, 0.3 * cm))

        # Section 5: Recycling Recommendations
        story.append(Paragraph("5. Recycling Recommendations", heading_style))
        rec = report_data["recycling_recommendations"]
        story.append(section_table([
            ["Primary Strategy", rec.get("primary_strategy", "—")],
            ["Strategy Description", rec.get("strategy_description", "—")],
            ["Reuse Opportunity", rec.get("reuse_opportunity", "—")],
            ["Upcycling Suggestion", rec.get("upcycling_suggestion", "—")],
            ["Material Recovery", rec.get("material_recovery", "—")],
        ]))
        story.append(Spacer(1, 0.3 * cm))

        # Section 6: Sustainability
        story.append(Paragraph("6. Sustainability Intelligence", heading_style))
        sus = report_data["sustainability_report"]
        carbon = sus.get("carbon_footprint", {})
        water = sus.get("water_savings", {})
        diversion = sus.get("waste_diversion", {})
        circular = sus.get("circular_economy", {})
        bench = sus.get("benchmarking", {})
        story.append(section_table([
            ["CO2 Saved (kg)", str(carbon.get("co2_saved_kg", "—"))],
            ["Water Saved (L)", str(water.get("liters_saved", "—"))],
            ["Landfill Diversion", diversion.get("diversion_rate", "—")],
            ["Circular Economy Score", str(circular.get("score", "—"))],
            ["Sustainability Rating", bench.get("rating", "—")],
        ]))
        story.append(Spacer(1, 0.3 * cm))

        # Section 7: Scores
        story.append(Paragraph("7. Waste Scoring", heading_style))
        sc = report_data["scores"]
        score_data = [
            ["Score", "Value", "Max"],
            ["Recyclability Score", str(sc.get("recyclability_score", 0)), "100"],
            ["Reuse Score", str(sc.get("reuse_score", 0)), "100"],
            ["Sustainability Score", str(sc.get("sustainability_score", 0)), "100"],
            ["Material Recovery Score", str(sc.get("material_recovery_score", 0)), "100"],
            ["Overall Circularity Score", str(sc.get("overall_circularity_score", 0)), "100"],
        ]
        score_table = Table(score_data, colWidths=[9 * cm, 4.5 * cm, 3.5 * cm])
        score_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1d4ed8")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f0f9ff")]),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#e5e7eb")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 0.3 * cm))

        story.append(Paragraph(
            f"Circularity Category: {sc.get('circularity_category', '—')}",
            normal_style
        ))
        story.append(Spacer(1, 0.3 * cm))

        # Final Recommendation
        story.append(Paragraph("8. Final Recommendation", heading_style))
        story.append(Paragraph(
            waste.get("final_recommendation", "—"),
            normal_style,
        ))

        story.append(Spacer(1, 0.5 * cm))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94a3b8")))
        story.append(Paragraph(
            "AI Textile Waste Intelligence Platform — Confidential Report",
            ParagraphStyle("footer", parent=styles["Normal"], fontSize=8,
                           textColor=colors.HexColor("#94a3b8"), alignment=TA_CENTER),
        ))

        doc.build(story)
        return buffer.getvalue()

    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise RuntimeError(f"PDF generation failed: {str(e)}")