"""
PDF Export Service
--------------------
Generates a downloadable PDF report from the combined waste
classification report data (image analysis + material classification
+ waste categorization + recyclability assessment).

This fulfills the spec's "PDF export" requirement under
Reports & Export System.
"""

from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_batch_waste_report_pdf(reports: list) -> BytesIO:
    """
    Takes a list of {"filename": ..., "report_data": {...}} entries and
    builds ONE combined, shareable PDF -- a cover summary page listing
    every item, followed by one detailed page per image.

    This is used for batch analysis of multiple textile images at once.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Title"], fontSize=18, spaceAfter=20
    )
    heading_style = ParagraphStyle(
        "HeadingStyle", parent=styles["Heading2"], spaceBefore=14, spaceAfter=8,
        textColor=colors.HexColor("#3B7A57"),
    )
    subheading_style = ParagraphStyle(
        "SubheadingStyle", parent=styles["Heading3"], spaceBefore=10, spaceAfter=6,
        textColor=colors.HexColor("#2F6346"),
    )
    normal_style = styles["Normal"]

    elements = []

    # --- Cover summary page ---
    elements.append(
        Paragraph("Batch Textile Waste Classification Report", title_style))
    elements.append(Paragraph(
        f"Total items analyzed: {len(reports)}", normal_style
    ))
    elements.append(Spacer(1, 0.4 * cm))

    summary_rows = [["#", "File", "Fabric Type",
                     "Waste Category", "Circularity Score"]]
    for i, entry in enumerate(reports, start=1):
        data = entry["report_data"]
        material = data.get("material_classification", {})
        waste = data.get("waste_categorization", {})
        recyclability = data.get("recyclability_assessment", {})
        summary_rows.append([
            str(i),
            entry["filename"],
            material.get("predicted_fiber_type", "N/A"),
            waste.get("waste_category", "N/A"),
            str(recyclability.get("circularity_score", "N/A")),
        ])

    summary_table = Table(
        summary_rows, colWidths=[1.2 * cm, 4 * cm, 3.5 * cm, 4 * cm, 3.5 * cm]
    )
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3B7A57")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.white, colors.HexColor("#F4F1EA")]),
    ]))
    elements.append(summary_table)
    elements.append(PageBreak())

    # --- One detailed section per image ---
    for i, entry in enumerate(reports, start=1):
        filename = entry["filename"]
        data = entry["report_data"]

        elements.append(Paragraph(f"Item {i}: {filename}", heading_style))
        elements.extend(_build_report_sections(data, subheading_style))

        if i < len(reports):
            elements.append(PageBreak())

    doc.build(elements)
    buffer.seek(0)
    return buffer


def _build_report_sections(report_data: dict, heading_style) -> list:
    """
    Shared helper: builds the Material / Waste / Recyclability / Image
    Analysis sections used by both the single-item and batch PDF reports.
    """
    elements = []

    material = report_data.get("material_classification", {})
    elements.append(Paragraph("Material Classification", heading_style))
    elements.append(_build_table([
        ["Predicted Fiber Type", material.get("predicted_fiber_type", "N/A")],
        ["Confidence", f"{material.get('confidence', 'N/A')}%"],
    ]))

    waste = report_data.get("waste_categorization", {})
    elements.append(Paragraph("Waste Categorization", heading_style))
    elements.append(_build_table([
        ["Waste Category", waste.get("waste_category", "N/A")],
        ["Reason", waste.get("reason", "N/A")],
    ]))

    recyclability = report_data.get("recyclability_assessment", {})
    elements.append(Paragraph("Recyclability Assessment", heading_style))
    elements.append(_build_table([
        ["Circularity Score", recyclability.get("circularity_score", "N/A")],
        ["Circularity Category", recyclability.get(
            "circularity_category", "N/A")],
    ]))

    breakdown = recyclability.get("breakdown", {})
    if breakdown:
        elements.append(Paragraph("Score Breakdown", heading_style))
        elements.append(_build_table(
            [[key.replace("_", " ").title(), value]
             for key, value in breakdown.items()]
        ))

    image_analysis = report_data.get("image_analysis", {})
    elements.append(Paragraph("Image Analysis", heading_style))

    basic_info = image_analysis.get("basic_info", {})
    color_analysis = image_analysis.get("color_analysis", {})
    brightness_analysis = image_analysis.get("brightness_analysis", {})
    texture_analysis = image_analysis.get("texture_analysis", {})
    damage_check = image_analysis.get("damage_contamination_check", {})

    elements.append(_build_table([
        ["Image Size",
            f"{basic_info.get('width', 'N/A')} x {basic_info.get('height', 'N/A')}"],
        ["Average Color (RGB)", f"R:{color_analysis.get('average_red', 'N/A')} "
         f"G:{color_analysis.get('average_green', 'N/A')} "
         f"B:{color_analysis.get('average_blue', 'N/A')}"],
        ["Brightness Level", brightness_analysis.get(
            "brightness_level", "N/A")],
        ["Texture Complexity", texture_analysis.get(
            "texture_complexity", "N/A")],
        ["Contamination Suspected", str(
            damage_check.get("contamination_suspected", "N/A"))],
    ]))

    return elements


def generate_waste_report_pdf(report_data: dict) -> BytesIO:
    """
    Takes the combined report dictionary (same structure as returned
    by WasteReportView) and builds a formatted PDF, returned as an
    in-memory file (BytesIO) ready to be sent as an HTTP response.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Title"], fontSize=18, spaceAfter=20
    )
    heading_style = ParagraphStyle(
        "HeadingStyle", parent=styles["Heading2"], spaceBefore=14, spaceAfter=8
    )
    normal_style = styles["Normal"]

    elements = []

    # --- Title ---
    elements.append(
        Paragraph("Textile Waste Classification Report", title_style))
    elements.append(Spacer(1, 0.3 * cm))

    elements.extend(_build_report_sections(report_data, heading_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def _build_table(data):
    """Helper to build a consistently styled 2-column table."""
    table = Table(data, colWidths=[6 * cm, 10 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f0f0f0")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table
