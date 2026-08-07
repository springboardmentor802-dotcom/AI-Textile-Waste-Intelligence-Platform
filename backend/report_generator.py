import io
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

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


# ─── Existing helpers (unchanged) ──────────────────────────────────

def _fmt_date(val: Any) -> str:
    if not val:
        return "—"
    if isinstance(val, (int, float)):
        try:
            return datetime.fromtimestamp(val, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        except Exception:
            return str(val)
    if isinstance(val, datetime):
        return val.strftime("%Y-%m-%d %H:%M UTC")
    if isinstance(val, str):
        try:
            fval = float(val)
            return datetime.fromtimestamp(fval, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        except ValueError:
            pass
        try:
            dt = datetime.fromisoformat(val.replace("Z", "+00:00"))
            return dt.strftime("%Y-%m-%d %H:%M UTC")
        except Exception:
            return val
    return str(val)


def _flatten(doc: dict) -> dict:
    analysis = doc.get("analysis", {}) or {}
    recyclability = doc.get("recyclability", {}) or {}
    component_scores = recyclability.get("component_scores", {}) or {}
    visual_features = analysis.get("visual_features", {}) or {}

    def _label(field: str) -> str:
        entry = analysis.get(field) or {}
        if isinstance(entry, dict):
            return entry.get("label") or "—"
        return str(entry) if entry else "—"

    def _confidence(field: str) -> str:
        entry = analysis.get(field) or {}
        if isinstance(entry, dict):
            conf = entry.get("confidence")
            return f"{round(conf * 100)}%" if conf is not None else "—"
        return "—"

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


# ─── Enhanced header (backward-compatible) ─────────────────────────

def _report_header(styles, user_email: str, subtitle: Optional[str] = None, batch_id: Optional[str] = None) -> list:
    title_style = ParagraphStyle("ReportTitle", parent=styles["Title"], textColor=BRAND_ORANGE)
    subtitle_style = ParagraphStyle(
        "ReportSubtitle", parent=styles["Normal"], fontSize=11, textColor=BRAND_GRAY
    )
    meta_style = ParagraphStyle(
        "ReportMeta", parent=styles["Normal"], fontSize=9, textColor=BRAND_GRAY
    )
    parts = [
        Paragraph(REPORT_TITLE, title_style),
        Paragraph(subtitle or REPORT_SUBTITLE, subtitle_style),
        Spacer(1, 4),
        Paragraph(
            f"Generated {_fmt_date(datetime.now(timezone.utc).timestamp())} for {user_email}",
            styles["Normal"],
        ),
    ]
    if batch_id:
        parts.append(Paragraph(f"Batch Reference: {batch_id}", meta_style))
    parts.append(Spacer(1, 16))
    return parts


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


# ─── Existing exports (unchanged) ──────────────────────────────────

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

    story = _report_header(styles, user_email, batch_id=batch_id)

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


# ═══════════════════════════════════════════════════════════════════
#  NEW SPECIALIZED REPORTS  (5 functions + helpers)
# ═══════════════════════════════════════════════════════════════════

def _safe_get(data: Any, path: str, default: Any = None) -> Any:
    """Defensive nested dict getter using dot notation."""
    if data is None:
        return default
    keys = path.split(".")
    for key in keys:
        if isinstance(data, dict) and key in data:
            data = data[key]
        else:
            return default
    return data if data is not None else default


def _analytics_summary_box(rows: List[list], col_widths: List[float]) -> Table:
    """Orange-themed summary box reused across all 5 new reports."""
    table = Table(rows, colWidths=col_widths)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BRAND_ORANGE_LIGHT),
                ("TEXTCOLOR", (0, 0), (0, -1), BRAND_GRAY),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BOX", (0, 0), (-1, -1), 0.5, BRAND_ORANGE_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BRAND_ORANGE_BORDER),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return table


def _bar_chart_row(label: str, value: float, max_val: float, color: colors.Color = BRAND_ORANGE) -> list:
    """Return a flowable list representing a horizontal bar chart row."""
    pct = min(100, (value / max(max_val, 1)) * 100) if max_val else 0
    bar_table = Table(
        [[""]],
        colWidths=[pct * 0.03 * inch],
        rowHeights=[8],
    )
    bar_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), color),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ])
    )
    return [label, bar_table, f"{value}"]


# ─── 1. WASTE CLASSIFICATION REPORT ────────────────────────────────

def generate_waste_classification_report(
    docs: List[dict],
    user_email: str,
    batch_id: Optional[str] = None,
    batch_meta: Optional[dict] = None,
) -> io.BytesIO:
    """
    Recycling Facilitator — Tab 1 (Inventory & Classification).
    Deep-dive on garment type, material, condition, visual features.
    """
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
        "Section", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6, textColor=BRAND_DARK
    )
    cell_style = ParagraphStyle("Cell", parent=styles["Normal"], fontSize=8, leading=10)

    story = _report_header(
        styles, user_email,
        subtitle="Waste Classification & Visual Feature Report",
        batch_id=batch_id,
    )

    # Batch meta summary if available
    if batch_meta:
        meta_rows = [
            ["Batch Label", str(batch_meta.get("label") or batch_meta.get("reference_label") or "—")],
            ["Source", str(batch_meta.get("source") or "—")],
            ["Quantity (kg)", str(batch_meta.get("quantity_kg") or "—")],
            ["Fabric Type", str(batch_meta.get("fabric_type") or "—")],
            ["Condition", str(batch_meta.get("condition") or "—")],
        ]
        story.append(_analytics_summary_box(meta_rows, [2 * inch, 4 * inch]))
        story.append(Spacer(1, 14))

    # Classification matrix
    story.append(Paragraph("Classification Matrix", section_style))
    header = ["Filename", "Scanned", "Garment", "Material", "Condition", "Primary Color", "Texture", "Pattern"]
    rows = [header]
    for d in docs:
        flat = _flatten(d)
        rows.append([
            Paragraph(flat["Filename"], cell_style),
            flat["Scanned"],
            Paragraph(f"{flat['Garment Type']} ({flat['Garment Confidence']})", cell_style),
            Paragraph(f"{flat['Material Type']} ({flat['Material Confidence']})", cell_style),
            Paragraph(f"{flat['Waste Condition']} ({flat['Condition Confidence']})", cell_style),
            flat["Primary Color"],
            flat["Texture"],
            flat["Pattern"],
        ])

    t = Table(
        rows,
        repeatRows=1,
        colWidths=[1.1 * inch, 0.9 * inch, 1.3 * inch, 1.3 * inch, 1.3 * inch, 0.9 * inch, 0.9 * inch, 0.9 * inch],
    )
    t.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_ROW_ALT]),
            ("GRID", (0, 0), (-1, -1), 0.4, BRAND_GRID),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    story.append(t)

    # Per-scan visual feature detail
    if docs:
        story.append(Spacer(1, 16))
        story.append(Paragraph("Per-Scan Visual Feature Detail", section_style))
        for d in docs:
            story.extend(_scan_detail_flowables(d, styles, heading_level="Heading3"))
            story.append(Spacer(1, 8))

    doc_template.build(story)
    buffer.seek(0)
    return buffer


# ─── 2. RECYCLING REPORT ───────────────────────────────────────────

def generate_recycling_report(
    docs: List[dict],
    user_email: str,
    batch_id: Optional[str] = None,
    batch_meta: Optional[dict] = None,
) -> io.BytesIO:
    """
    Recycling Facilitator — Tab 3 (Recovery Pathways).
    Focus on recommended pathways, component scores, material recovery.
    """
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
        "Section", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6, textColor=BRAND_DARK
    )
    cell_style = ParagraphStyle("Cell", parent=styles["Normal"], fontSize=8.5, leading=10)

    story = _report_header(
        styles, user_email,
        subtitle="Recycling Pathway & Material Recovery Report",
        batch_id=batch_id,
    )

    if batch_meta:
        meta_rows = [
            ["Batch Label", str(batch_meta.get("label") or batch_meta.get("reference_label") or "—")],
            ["Source", str(batch_meta.get("source") or "—")],
            ["Quantity (kg)", str(batch_meta.get("quantity_kg") or "—")],
            ["Dominant Condition", str(batch_meta.get("condition") or "—")],
        ]
        story.append(_analytics_summary_box(meta_rows, [2 * inch, 4 * inch]))
        story.append(Spacer(1, 14))

    # Aggregate pathway breakdown
    pathway_counts: Dict[str, int] = {}
    for d in docs:
        opt = _safe_get(d, "recyclability.recommended_recycling_option", "Unknown")
        pathway_counts[opt] = pathway_counts.get(opt, 0) + 1

    if pathway_counts:
        story.append(Paragraph("Recommended Recycling Pathways", section_style))
        p_rows = [["Pathway", "Scan Count", "Share"]]
        total = sum(pathway_counts.values())
        for opt, cnt in sorted(pathway_counts.items(), key=lambda x: -x[1]):
            p_rows.append([opt, str(cnt), f"{round((cnt / total) * 100, 1)}%"])
        story.append(_striped_table(p_rows, [4 * inch, 1.5 * inch, 1.5 * inch]))
        story.append(Spacer(1, 14))

    # Component score matrix
    story.append(Paragraph("Component Score Matrix", section_style))
    header = ["Filename", "Material", "Recycl.", "Reuse", "Sustain.", "Mat.Rec.", "Overall", "Category", "Pathway"]
    rows = [header]
    for d in docs:
        flat = _flatten(d)
        rows.append([
            Paragraph(flat["Filename"], cell_style),
            flat["Material Type"],
            str(flat["Recyclability Score"]),
            str(flat["Reuse Score"]),
            str(flat["Sustainability Score"]),
            str(flat["Material Recovery Score"]),
            str(flat["Overall Circularity Score"]),
            Paragraph(flat["Circularity Category"], cell_style),
            Paragraph(flat["Recommended Pathway"], cell_style),
        ])

    t = Table(
        rows,
        repeatRows=1,
        colWidths=[1.1 * inch, 0.9 * inch, 0.6 * inch, 0.6 * inch, 0.6 * inch, 0.6 * inch, 0.6 * inch, 1.1 * inch, 1.2 * inch],
    )
    t.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_ROW_ALT]),
            ("GRID", (0, 0), (-1, -1), 0.4, BRAND_GRID),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    story.append(t)

    doc_template.build(story)
    buffer.seek(0)
    return buffer


# ─── 3. SUSTAINABILITY REPORT ──────────────────────────────────────

def generate_sustainability_report(
    docs: List[dict],
    user_email: str,
    batch_id: Optional[str] = None,
    benchmark_data: Optional[dict] = None,
) -> io.BytesIO:
    """
    Sustainability Manager — Tab 1 (ESG Metrics & Benchmarks).
    Period-over-period benchmarking, circularity trends, score distributions.
    """
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
        "Section", parent=styles["Heading2"], spaceBefore=16, spaceAfter=6, textColor=BRAND_DARK
    )
    story = _report_header(
        styles, user_email,
        subtitle="Sustainability Benchmarking & ESG Report",
        batch_id=batch_id,
    )

    # Benchmark summary
    if benchmark_data:
        story.append(Paragraph("Period-over-Period Benchmark", section_style))
        bench_rows = [["Metric", "Current Period", "Previous Period", "Change"]]
        for metric, keys in [
            ("CO₂e Avoided (kg)", "co2e_avoided_kg"),
            ("Water Saved (L)", "water_saved_l"),
            ("Landfill Diverted (kg)", "landfill_diverted_kg"),
            ("Items Scanned", "item_count"),
        ]:
            block = benchmark_data.get(keys) or {}
            curr = block.get("current", 0)
            prev = block.get("previous", 0)
            change = block.get("change_pct")
            change_str = f"{change:+.1f}%" if change is not None else "—"
            bench_rows.append([metric, str(curr), str(prev), change_str])
        story.append(_striped_table(bench_rows, [2.5 * inch, 1.8 * inch, 1.8 * inch, 1.2 * inch]))
        story.append(Spacer(1, 16))

    # Circularity distribution
    story.append(Paragraph("Circularity Score Distribution", section_style))
    cat_counts: Dict[str, int] = {}
    for d in docs:
        cat = _safe_get(d, "recyclability.circularity_category", "Unknown")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    if cat_counts:
        max_cnt = max(cat_counts.values())
        for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
            story.append(Table(
                [[cat, f"{cnt} scans"]],
                colWidths=[4 * inch, 1.5 * inch],
                style=TableStyle([
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            ))
            bar = Table([[""]], colWidths=[(cnt / max(max_cnt, 1)) * 4 * inch], rowHeights=[6])
            bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), BRAND_ORANGE)]))
            story.append(bar)
            story.append(Spacer(1, 4))

    # Score averages
    if docs:
        story.append(Spacer(1, 10))
        story.append(Paragraph("Aggregate Score Averages", section_style))
        agg = {"Recyclability": [], "Reuse": [], "Sustainability": [], "Material Recovery": []}
        for d in docs:
            cs = d.get("recyclability", {}).get("component_scores", {}) or {}
            agg["Recyclability"].append(cs.get("recyclability_score", 0))
            agg["Reuse"].append(cs.get("reuse_score", 0))
            agg["Sustainability"].append(cs.get("sustainability_score", 0))
            agg["Material Recovery"].append(cs.get("material_recovery_score", 0))

        avg_rows = [["Component", "Average Score", "Min", "Max"]]
        for k, vals in agg.items():
            if vals:
                avg_rows.append([k, f"{round(sum(vals) / len(vals), 1)}", f"{min(vals)}", f"{max(vals)}"])
        story.append(_striped_table(avg_rows, [3 * inch, 1.5 * inch, 1 * inch, 1 * inch]))

    doc_template.build(story)
    buffer.seek(0)
    return buffer


# ─── 4. ENVIRONMENTAL IMPACT REPORT ────────────────────────────────

def generate_environmental_impact_report(
    docs: List[dict],
    user_email: str,
    batch_id: Optional[str] = None,
    impact_data: Optional[dict] = None,
) -> io.BytesIO:
    """
    Sustainability Manager — Tab 2 (CO₂e & Water).
    Environmental footprint estimation by material with totals.
    """
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
        "Section", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6, textColor=BRAND_DARK
    )
    story = _report_header(
        styles, user_email,
        subtitle="Environmental Impact Assessment Report",
        batch_id=batch_id,
    )

    # Top-line impact summary
    if impact_data:
        story.append(Paragraph("Impact Summary", section_style))
        imp_rows = [
            ["Total Items", str(impact_data.get("item_count", "—"))],
            ["Total Weight (kg)", str(impact_data.get("total_weight_kg", "—"))],
            ["CO₂e Avoided (kg)", str(impact_data.get("total_co2e_avoided_kg", "—"))],
            ["Water Saved (L)", str(impact_data.get("total_water_saved_l", "—"))],
            ["Landfill Diverted (kg)", str(impact_data.get("total_landfill_diverted_kg", "—"))],
        ]
        story.append(_analytics_summary_box(imp_rows, [2.5 * inch, 2.5 * inch]))
        story.append(Spacer(1, 16))

        # By-material breakdown
        by_material = impact_data.get("by_material") or []
        if by_material:
            story.append(Paragraph("Impact Breakdown by Material", section_style))
            rows = [["Material", "Items", "Weight (kg)", "CO₂e Avoided", "Water Saved (L)", "Landfill Diverted"]]
            for row in by_material:
                rows.append([
                    row.get("material_type", "—"),
                    str(row.get("item_count", "—")),
                    str(row.get("weight_kg", "—")),
                    str(row.get("co2e_avoided_kg", "—")),
                    str(row.get("water_saved_l", "—")),
                    str(row.get("landfill_diverted_kg", "—")),
                ])
            story.append(_striped_table(rows, [1.5 * inch, 0.8 * inch, 1.2 * inch, 1.4 * inch, 1.4 * inch, 1.4 * inch]))

    # Per-scan impact estimates (if docs present but no aggregate data)
    elif docs:
        story.append(Paragraph("Per-Scan Environmental Estimates", section_style))
        rows = [["Filename", "Material", "Est. Weight (kg)", "CO₂e (kg)", "Water (L)", "Landfill (kg)"]]
        for d in docs:
            flat = _flatten(d)
            mat = flat["Material Type"]
            # Synthetic estimates if no explicit impact block
            weight = 0.5  # default synthetic
            co2 = round(weight * 5.5, 2)
            water = round(weight * 400, 0)
            landfill = round(weight * 0.95, 2)
            rows.append([
                Paragraph(flat["Filename"], ParagraphStyle("C", parent=styles["Normal"], fontSize=8)),
                mat,
                str(weight),
                str(co2),
                str(water),
                str(landfill),
            ])
        story.append(_striped_table(rows, [1.8 * inch, 1.2 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch]))

    doc_template.build(story)
    buffer.seek(0)
    return buffer


# ─── 5. CIRCULAR ECONOMY REPORT ────────────────────────────────────

def generate_circular_economy_report(
    docs: List[dict],
    user_email: str,
    batch_id: Optional[str] = None,
    circular_data: Optional[dict] = None,
    diversion_data: Optional[dict] = None,
) -> io.BytesIO:
    """
    Sustainability Manager — Tab 3 (Circular Tiers & Diversion).
    Loop hierarchy, diversion rates, recycling option streams.
    """
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
        "Section", parent=styles["Heading2"], spaceBefore=16, spaceAfter=6, textColor=BRAND_DARK
    )
    story = _report_header(
        styles, user_email,
        subtitle="Circular Economy & Waste Diversion Report",
        batch_id=batch_id,
    )

    # Circular economy summary
    if circular_data:
        story.append(Paragraph("Circular Economy Overview", section_style))
        circ_rows = [
            ["Total Items", str(circular_data.get("item_count", "—"))],
            ["Average Circularity Score", str(circular_data.get("average_circularity_score", "—"))],
            ["Fleet Circularity Index", str(circular_data.get("fleet_circularity_index", "—"))],
        ]
        story.append(_analytics_summary_box(circ_rows, [2.5 * inch, 2.5 * inch]))
        story.append(Spacer(1, 16))

        # Loop tier breakdown
        tiers = circular_data.get("loop_tier_breakdown") or []
        if tiers:
            story.append(Paragraph("Loop Tier Hierarchy", section_style))
            t_rows = [["Tier", "Items", "Percentage"]]
            max_items = max((t.get("item_count", 0) for t in tiers), default=1)
            for t in tiers:
                t_rows.append([
                    t.get("tier", "—"),
                    str(t.get("item_count", "—")),
                    f"{t.get('percentage', 0)}%",
                ])
            story.append(_striped_table(t_rows, [3 * inch, 1.5 * inch, 1.5 * inch]))
            story.append(Spacer(1, 10))

            # Visual bars
            for t in tiers:
                label = t.get("tier", "")
                cnt = t.get("item_count", 0)
                pct = t.get("percentage", 0)
                story.append(Paragraph(f"{label} — {cnt} items ({pct}%)", styles["Normal"]))
                bar = Table([[""]], colWidths=[(cnt / max(max_items, 1)) * 4.5 * inch], rowHeights=[8])
                bar.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), BRAND_ORANGE)]))
                story.append(bar)
                story.append(Spacer(1, 4))

        # Recycling option breakdown
        options = circular_data.get("recycling_option_breakdown") or []
        if options:
            story.append(Spacer(1, 10))
            story.append(Paragraph("Recycling Option Streams", section_style))
            o_rows = [["Recycling Option", "Items", "Share"]]
            for o in options:
                o_rows.append([
                    o.get("recycling_option", "—"),
                    str(o.get("item_count", "—")),
                    f"{o.get('percentage', 0)}%",
                ])
            story.append(_striped_table(o_rows, [4 * inch, 1.5 * inch, 1.5 * inch]))

    # Waste diversion section
    if diversion_data:
        story.append(Spacer(1, 16))
        story.append(Paragraph("Waste Diversion Analysis", section_style))
        div_rows = [
            ["Total Items", str(diversion_data.get("item_count", "—"))],
            ["Diversion Rate", f"{diversion_data.get('diversion_rate_pct', '—')}%"],
            ["Diverted", str(diversion_data.get("diverted_count", "—"))],
            ["Non-Diverted", str(diversion_data.get("non_diverted_count", "—"))],
        ]
        story.append(_analytics_summary_box(div_rows, [2.5 * inch, 2.5 * inch]))
        story.append(Spacer(1, 10))

        by_mat = diversion_data.get("by_material") or []
        if by_mat:
            m_rows = [["Material", "Total", "Diverted", "Diversion Rate"]]
            for m in by_mat:
                m_rows.append([
                    m.get("material_type", "—"),
                    str(m.get("total", "—")),
                    str(m.get("diverted", "—")),
                    f"{m.get('diversion_rate_pct', 0)}%",
                ])
            story.append(_striped_table(m_rows, [2.5 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch]))

    doc_template.build(story)
    buffer.seek(0)
    return buffer