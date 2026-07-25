import io
from datetime import datetime, timezone
from typing import List

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    ListFlowable,
    ListItem,
)

REPORT_TITLE = "SorTex AI Textile Waste Intelligence Platform"
REPORT_SUBTITLE = "Waste Classification & Recyclability Report"

BRAND_ORANGE = colors.HexColor("#c2410c")
BRAND_ORANGE_LIGHT = colors.HexColor("#fff7ed")
BRAND_ORANGE_BORDER = colors.HexColor("#fed7aa")
BRAND_DARK = colors.HexColor("#1c1917")
BRAND_GRAY = colors.HexColor("#57534e")
BRAND_ROW_ALT = colors.HexColor("#fafaf9")
BRAND_GRID = colors.HexColor("#e7e5e4")

def _fmt_date(epoch_seconds: float) -> str:
    if not epoch_seconds:
        return "—"
    return datetime.fromtimestamp(epoch_seconds, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

def _flatten(doc: dict) -> dict:
    analysis = doc.get("analysis", {}) or {}
    recyclability = doc.get("recyclability", {}) or {}
    component_scores = recyclability.get("component_scores", {}) or {}
    visual_features = analysis.get("visual_features", {}) or {}

    def _label(field: str) -> str:
        entry = analysis.get(field) or {}
        return entry.get("label") or "—"

    def _confidence(field: str) -> str:
        entry = analysis.get(field) or {}
        conf = entry.get("confidence")
        return f"{round(conf * 100)}%" if conf is not None else "—"

    return {
        "Filename": doc.get("filename") or "—",
        "Scanned": _fmt_date(doc.get("created_at")),
        "Batch ID": doc.get("batch_id") or "—",
        "Garment Type": _label("garment_type"),
        "Garment Confidence": _confidence("garment_type"),
        "Material Type": _label("material_type"),
        "Material Confidence": _confidence("material_type"),
        "Waste Condition": _label("waste_status"),
        "Condition Confidence": _confidence("waste_status"),
        "Texture": (visual_features.get("texture") or {}).get("label") or "—",
        "Pattern": (visual_features.get("pattern") or {}).get("label") or "—",
        "Primary Color": (visual_features.get("color_analysis") or {}).get("primary_color") or "—",
        "Recyclability Score": component_scores.get("recyclability_score", "—"),
        "Reuse Score": component_scores.get("reuse_score", "—"),
        "Sustainability Score": component_scores.get("sustainability_score", "—"),
        "Material Recovery Score": component_scores.get("material_recovery_score", "—"),
        "Overall Circularity Score": recyclability.get("circularity_score", "—"),
        "Circularity Category": recyclability.get("circularity_category", "—"),
        "Recommended Pathway": recyclability.get("recommended_recycling_option", "—"),
        "Waste Reduction Tips": recyclability.get("waste_reduction_tips", []) or [],
    }

def generate_excel_report(docs: List[dict]) -> io.BytesIO:
    rows = []
    for doc in docs:
        flat = _flatten(doc)
        flat["Waste Reduction Tips"] = " | ".join(flat["Waste Reduction Tips"]) or "—"
        rows.append(flat)
    df = pd.DataFrame(rows)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Scan History")
        worksheet = writer.sheets["Scan History"]
        for column_cells in worksheet.columns:
            length = max(
                (len(str(cell.value)) if cell.value is not None else 0) for cell in column_cells
            )
            worksheet.column_dimensions[column_cells[0].column_letter].width = min(
                max(length + 2, 12), 50
            )
    buffer.seek(0)
    return buffer

def _report_header(styles, user_email: str) -> list:
    title_style = ParagraphStyle("ReportTitle", parent=styles["Title"], textColor=BRAND_ORANGE)
    subtitle_style = ParagraphStyle(
        "ReportSubtitle", parent=styles["Normal"], fontSize=11, textColor=BRAND_GRAY
    )
    return [
        Paragraph(REPORT_TITLE, title_style),
        Paragraph(REPORT_SUBTITLE, subtitle_style),
        Spacer(1, 4),
        Paragraph(
            f"Generated {_fmt_date(datetime.now(timezone.utc).timestamp())} for {user_email}",
            styles["Normal"],
        ),
        Spacer(1, 16),
    ]

def _scan_detail_flowables(doc: dict, styles, heading_level: str = "Heading2") -> list:
    section_style = ParagraphStyle(
        "SubSection", parent=styles[heading_level], spaceBefore=10, spaceAfter=6, textColor=BRAND_DARK
    )
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9.5, leading=13)
    tip_style = ParagraphStyle("Tip", parent=styles["Normal"], fontSize=9, leading=12)

    flat = _flatten(doc)
    flow = []

    flow.append(Paragraph("Classification", section_style))
    classification_rows = [
        ["Field", "Result", "Confidence"],
        ["Garment Type", flat["Garment Type"], flat["Garment Confidence"]],
        ["Material Type", flat["Material Type"], flat["Material Confidence"]],
        ["Waste Condition", flat["Waste Condition"], flat["Condition Confidence"]],
    ]
    flow.append(_striped_table(classification_rows, colWidths=[1.8 * inch, 2.2 * inch, 1.3 * inch]))

    flow.append(Paragraph("Visual Features", section_style))
    visual_rows = [
        ["Feature", "Result"],
        ["Primary Color", flat["Primary Color"]],
        ["Texture", flat["Texture"]],
        ["Pattern", flat["Pattern"]],
    ]
    flow.append(_striped_table(visual_rows, colWidths=[2.2 * inch, 3.1 * inch]))

    flow.append(Paragraph("Circularity Score Breakdown", section_style))
    score_rows = [
        ["Component", "Score"],
        ["Recyclability Score", flat["Recyclability Score"]],
        ["Reuse Score", flat["Reuse Score"]],
        ["Sustainability Score", flat["Sustainability Score"]],
        ["Material Recovery Score", flat["Material Recovery Score"]],
        ["Overall Circularity Score", flat["Overall Circularity Score"]],
        ["Circularity Category", flat["Circularity Category"]],
    ]
    flow.append(_striped_table(score_rows, colWidths=[3 * inch, 2.3 * inch]))

    flow.append(Paragraph("Recommended Pathway", section_style))
    flow.append(Paragraph(str(flat["Recommended Pathway"]), body_style))

    flow.append(Paragraph("Waste Reduction Tips", section_style))
    tips = flat["Waste Reduction Tips"]
    if tips:
        flow.append(
            ListFlowable(
                [ListItem(Paragraph(tip, tip_style), bulletColor=BRAND_ORANGE) for tip in tips],
                bulletType="bullet",
                start="circle",
            )
        )
    else:
        flow.append(Paragraph("No specific tips available for this scan.", body_style))

    return flow

def generate_pdf_report(docs: List[dict], user_email: str) -> io.BytesIO:
    buffer = io.BytesIO()
    doc_template = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.4 * inch,
        rightMargin=0.4 * inch,
    )
    styles = getSampleStyleSheet()
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"], spaceBefore=16, textColor=BRAND_DARK
    )
    cell_style = ParagraphStyle("Cell", parent=styles["Normal"], fontSize=7.5, leading=9)

    story = _report_header(styles, user_email)

    scores = [
        d.get("recyclability", {}).get("circularity_score", 0)
        for d in docs
        if d.get("recyclability", {}).get("circularity_score") is not None
    ]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    summary_data = [
        ["Total Scans", str(len(docs))],
        ["Average Circularity Score", f"{avg_score} / 100"],
    ]
    summary_table = Table(summary_data, colWidths=[2.5 * inch, 2.5 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BRAND_ORANGE_LIGHT),
                ("TEXTCOLOR", (0, 0), (0, -1), BRAND_GRAY),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
                ("BOX", (0, 0), (-1, -1), 0.5, BRAND_ORANGE_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BRAND_ORANGE_BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 20))

    story.append(Paragraph("Scan Details", section_style))
    story.append(
        Paragraph(
            "Full waste reduction tips for each scan are available in that scan's "
            "individual PDF report.",
            ParagraphStyle("Note", parent=styles["Normal"], fontSize=8, textColor=BRAND_GRAY),
        )
    )
    story.append(Spacer(1, 8))

    header = [
        "Filename", "Batch ID", "Scanned", "Garment", "Material", "Condition",
        "Texture", "Pattern", "Recycl.", "Reuse", "Sustain.",
        "Mat. Rec.", "Overall", "Category",
    ]
    table_rows = [header]
    for d in docs:
        flat = _flatten(d)
        table_rows.append(
            [
                Paragraph(flat["Filename"], cell_style),
                Paragraph(flat["Batch ID"], cell_style),
                Paragraph(flat["Scanned"], cell_style),
                Paragraph(flat["Garment Type"], cell_style),
                Paragraph(flat["Material Type"], cell_style),
                Paragraph(flat["Waste Condition"], cell_style),
                Paragraph(flat["Texture"], cell_style),
                Paragraph(flat["Pattern"], cell_style),
                str(flat["Recyclability Score"]),
                str(flat["Reuse Score"]),
                str(flat["Sustainability Score"]),
                str(flat["Material Recovery Score"]),
                str(flat["Overall Circularity Score"]),
                Paragraph(flat["Circularity Category"], cell_style),
            ]
        )

    detail_table = Table(
        table_rows,
        repeatRows=1,
        colWidths=[
            0.85 * inch, 0.75 * inch, 0.8 * inch, 0.6 * inch, 0.6 * inch, 0.65 * inch,
            0.6 * inch, 0.65 * inch, 0.5 * inch, 0.45 * inch, 0.5 * inch,
            0.5 * inch, 0.45 * inch, 0.85 * inch,
        ],
    )
    detail_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_ROW_ALT]),
                ("GRID", (0, 0), (-1, -1), 0.4, BRAND_GRID),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(detail_table)

    doc_template.build(story)
    buffer.seek(0)
    return buffer

def generate_single_scan_pdf_report(doc: dict, user_email: str) -> io.BytesIO:
    buffer = io.BytesIO()
    doc_template = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
    )
    styles = getSampleStyleSheet()
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"], spaceBefore=18, spaceAfter=6, textColor=BRAND_DARK
    )

    flat = _flatten(doc)
    story = _report_header(styles, user_email)

    story.append(Paragraph("Scan Overview", section_style))
    overview_rows = [
        ["Filename", flat["Filename"]],
        ["Batch ID", flat["Batch ID"]],
        ["Scanned", flat["Scanned"]],
    ]
    story.append(_kv_table(overview_rows))

    story.extend(_scan_detail_flowables(doc, styles))

    doc_template.build(story)
    buffer.seek(0)
    return buffer

def generate_batch_pdf_report(docs: List[dict], batch_id: str, user_email: str) -> io.BytesIO:
    buffer = io.BytesIO()
    doc_template = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
    )
    styles = getSampleStyleSheet()
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"], spaceBefore=18, spaceAfter=6, textColor=BRAND_DARK
    )
    scan_header_style = ParagraphStyle(
        "ScanHeader", parent=styles["Heading2"], spaceBefore=24, spaceAfter=4, textColor=BRAND_ORANGE
    )
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14)
    note_style = ParagraphStyle("Note", parent=styles["Normal"], fontSize=8.5, textColor=BRAND_GRAY, spaceBefore=10)
    cell_style = ParagraphStyle("Cell", parent=styles["Normal"], fontSize=8.5, leading=10)

    story = _report_header(styles, user_email)
    story.append(Paragraph(
        f"Batch ID: {batch_id}",
        ParagraphStyle("BatchId", parent=styles["Normal"], fontSize=11, textColor=BRAND_GRAY),
    ))
    story.append(Spacer(1, 10))

    scores = [
        d.get("recyclability", {}).get("circularity_score", 0)
        for d in docs
        if d.get("recyclability", {}).get("circularity_score") is not None
    ]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    materials_count: dict = {}
    for d in docs:
        mat = (d.get("analysis", {}).get("material_type") or {}).get("label") or "Unknown"
        materials_count[mat] = materials_count.get(mat, 0) + 1
    dominant_material = max(materials_count, key=materials_count.get) if materials_count else "Unknown"

    summary_data = [
        ["Total Scans in Batch", str(len(docs))],
        ["Average Circularity Score", f"{avg_score} / 100"],
        ["Dominant Material", dominant_material],
    ]
    summary_table = Table(summary_data, colWidths=[2.7 * inch, 2.9 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BRAND_ORANGE_LIGHT),
                ("TEXTCOLOR", (0, 0), (0, -1), BRAND_GRAY),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
                ("BOX", (0, 0), (-1, -1), 0.5, BRAND_ORANGE_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BRAND_ORANGE_BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Scans in This Batch", section_style))
    header = ["#", "Filename", "Material", "Condition", "Circularity", "Category"]
    table_rows = [header]
    for i, d in enumerate(docs, start=1):
        flat = _flatten(d)
        table_rows.append([
            str(i),
            Paragraph(flat["Filename"], cell_style),
            Paragraph(flat["Material Type"], cell_style),
            Paragraph(flat["Waste Condition"], cell_style),
            str(flat["Overall Circularity Score"]),
            Paragraph(flat["Circularity Category"], cell_style),
        ])
    overview_table = Table(
        table_rows,
        repeatRows=1,
        colWidths=[0.35 * inch, 2 * inch, 1.2 * inch, 1.2 * inch, 0.9 * inch, 1.55 * inch],
    )
    overview_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_ROW_ALT]),
                ("GRID", (0, 0), (-1, -1), 0.4, BRAND_GRID),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(overview_table)

    story.append(Paragraph(
        "Full per-scan breakdowns for every image in this batch follow below. "
        "Each scan is also available as its own single-scan PDF from the Scan "
        "History panel if you only need one image's details.",
        note_style,
    ))

    for i, d in enumerate(docs, start=1):
        flat = _flatten(d)
        story.append(Paragraph(f"Scan {i} of {len(docs)}: {flat['Filename']}", scan_header_style))
        story.append(Paragraph(f"Scanned {flat['Scanned']}", body_style))
        story.extend(_scan_detail_flowables(d, styles, heading_level="Heading3"))

    doc_template.build(story)
    buffer.seek(0)
    return buffer

def _kv_table(rows: List[list]) -> Table:
    table = Table(rows, colWidths=[1.5 * inch, 5 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), BRAND_ORANGE_LIGHT),
                ("TEXTCOLOR", (0, 0), (0, -1), BRAND_GRAY),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.4, BRAND_GRID),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table

def _striped_table(rows: List[list], colWidths: List[float]) -> Table:
    table = Table(rows, colWidths=colWidths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_ROW_ALT]),
                ("GRID", (0, 0), (-1, -1), 0.4, BRAND_GRID),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table