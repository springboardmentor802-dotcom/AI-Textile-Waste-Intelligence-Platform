

import { jsPDF } from "jspdf";

// --- Palette (kept in the same green/white family used across the app) ---
const COLORS = {
  green: [46, 125, 50], // #2e7d32
  greenDark: [37, 100, 40], // #256428
  greenLight: [232, 245, 233], // #e8f5e9
  gray: [107, 114, 128], // #6b7280
  grayMuted: [156, 163, 175], // #9ca3af
  grayLight: [243, 244, 246], // #f3f4f6
  dark: [26, 26, 26], // #1a1a1a
  border: [238, 241, 238], // #eef1ee
  amber: [180, 83, 9], // #b45309
  amberLight: [255, 247, 230], // #fff7e6
  red: [185, 28, 28], // #b91c1c
  redLight: [254, 242, 242], // #fef2f2
  white: [255, 255, 255],
};

const PAGE_MARGIN = 48;
const BRAND_NAME = "AI Fabric Intelligence Platform";

/**
 * Reads a File/Blob as a base64 data URL (needed to embed images via
 * jsPDF's addImage).
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setFill(doc, rgb) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setTextColor(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function setDraw(doc, rgb) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

/** Maps a recyclability string to a pill color tone. Unknown values fall
 * back to a neutral gray rather than guessing. */
function recyclabilityTone(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "high") return { fill: COLORS.greenLight, text: COLORS.green };
  if (normalized === "medium") return { fill: COLORS.amberLight, text: COLORS.amber };
  if (normalized === "low") return { fill: COLORS.redLight, text: COLORS.red };
  return { fill: COLORS.grayLight, text: COLORS.gray };
}

/** Small rounded "pill" badge, e.g. for the Recyclability value. */
function drawPill(doc, text, x, y, tone) {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const textWidth = doc.getTextWidth(text);
  const paddingX = 10;
  const height = 18;
  const width = textWidth + paddingX * 2;

  setFill(doc, tone.fill);
  doc.roundedRect(x, y - height + 5, width, height, height / 2, height / 2, "F");
  setTextColor(doc, tone.text);
  doc.text(text, x + paddingX, y);
  return width;
}

/** Horizontal progress/confidence bar with rounded ends. */
function drawProgressBar(doc, x, y, width, height, percent, fillColor) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  setFill(doc, COLORS.grayLight);
  doc.roundedRect(x, y, width, height, height / 2, height / 2, "F");

  const filledWidth = Math.max(height, (clamped / 100) * width);
  setFill(doc, fillColor);
  doc.roundedRect(x, y, filledWidth, height, height / 2, height / 2, "F");
}

/** A soft rounded card container used to visually group each section. */
function drawCard(doc, x, y, width, height) {
  setDraw(doc, COLORS.border);
  setFill(doc, COLORS.white);
  doc.roundedRect(x, y, width, height, 8, 8, "FD");
}

/**
 * Page header band: brand mark, report title, and a subtitle line
 * (timestamp, or "Item X of Y" for batch report pages).
 */
function drawHeader(doc, { title, subtitle }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const bandHeight = 78;

  setFill(doc, COLORS.green);
  doc.rect(0, 0, pageWidth, bandHeight, "F");
  // Subtle darker accent line along the bottom edge of the header band
  setFill(doc, COLORS.greenDark);
  doc.rect(0, bandHeight - 3, pageWidth, 3, "F");

  // Simple circular brand mark
  setFill(doc, COLORS.white);
  doc.circle(PAGE_MARGIN + 10, 30, 11, "F");
  setFill(doc, COLORS.green);
  doc.circle(PAGE_MARGIN + 10, 30, 6, "F");

  setTextColor(doc, COLORS.white);
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.text(title, PAGE_MARGIN + 32, 34);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text(BRAND_NAME, PAGE_MARGIN + 32, 48);

  doc.setFontSize(9.5);
  doc.text(subtitle || new Date().toLocaleString(), pageWidth - PAGE_MARGIN, 34, { align: "right" });

  return bandHeight + 28;
}

/** Section heading with a small green accent bar, used inside each card. */
function drawSectionHeading(doc, title, x, y) {
  setFill(doc, COLORS.green);
  doc.rect(x, y - 9, 3, 12, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.dark);
  doc.text(title, x + 10, y);
  return y + 16;
}

/** Label/value row. Label is small-caps gray, value is dark and can wrap. */
function drawKeyValue(doc, label, value, x, y, wrapWidth) {
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.grayMuted);
  doc.text(label.toUpperCase(), x, y);

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  setTextColor(doc, COLORS.dark);

  const valueText = String(value ?? "-");
  const valueY = y + 13;
  if (wrapWidth) {
    const lines = doc.splitTextToSize(valueText, wrapWidth);
    doc.text(lines, x, valueY);
    return valueY + lines.length * 13 + 10;
  }

  doc.text(valueText, x, valueY);
  return valueY + 18;
}

/**
 * Draws one full prediction "page" of content (header, image + confidence
 * bar, waste/recycling card, fabric info card, top-3 card) onto whatever
 * page in `doc` is currently active. Shared by both the single-result
 * report and each detail page of the batch report.
 */
async function drawPredictionPage(doc, params) {
  const {
    imageFile,
    material,
    confidence,
    wasteCategory,
    recyclability,
    recommendation,
    top3Predictions = [],
    materialTypeInfo,
    processingTimeSeconds,
    headerSubtitle,
  } = params;

  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  let y = drawHeader(doc, { title: "Fabric Prediction Report", subtitle: headerSubtitle });

  // --- Overview card: image + material + confidence bar ---
  const overviewHeight = 172;
  drawCard(doc, PAGE_MARGIN, y, contentWidth, overviewHeight);
  const cardPadding = 18;
  const imageSize = overviewHeight - cardPadding * 2;

  if (imageFile) {
    try {
      const dataUrl = await fileToDataUrl(imageFile);
      const imageFormat = imageFile.type.includes("png") ? "PNG" : "JPEG";
      setDraw(doc, COLORS.border);
      doc.roundedRect(PAGE_MARGIN + cardPadding - 2, y + cardPadding - 2, imageSize + 4, imageSize + 4, 6, 6, "S");
      doc.addImage(
        dataUrl,
        imageFormat,
        PAGE_MARGIN + cardPadding,
        y + cardPadding,
        imageSize,
        imageSize,
        undefined,
        "FAST"
      );
    } catch {
      // Continue without the image rather than failing the whole report.
    }
  }

  const textX = PAGE_MARGIN + cardPadding + imageSize + 20;
  const textWidth = contentWidth - cardPadding * 2 - imageSize - 20;
  let textY = y + cardPadding + 16;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.dark);
  doc.text(material, textX, textY);
  textY += 26;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.grayMuted);
  doc.text("CONFIDENCE", textX, textY);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.green);
  doc.text(`${confidence}%`, textX + textWidth, textY, { align: "right" });
  textY += 8;
  drawProgressBar(doc, textX, textY, textWidth, 8, confidence, COLORS.green);
  textY += 26;

  if (typeof processingTimeSeconds === "number") {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    setTextColor(doc, COLORS.gray);
    doc.text(`AI Processing Time: ${processingTimeSeconds.toFixed(2)} sec`, textX, textY);
    textY += 16;
  }

  const recTone = recyclabilityTone(recyclability);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.grayMuted);
  doc.text("RECYCLABILITY", textX, textY + 12);
  drawPill(doc, String(recyclability ?? "Unknown"), textX, textY + 30, recTone);

  y += overviewHeight + 20;

  // --- Waste & Recycling card ---
  const wasteLines = doc.splitTextToSize(String(recommendation ?? "-"), contentWidth - 36);
  const wasteHeight = 66 + wasteLines.length * 13;
  drawCard(doc, PAGE_MARGIN, y, contentWidth, wasteHeight);
  let innerY = drawSectionHeading(doc, "Waste & Recycling", PAGE_MARGIN + 16, y + 24);
  const halfWidth = (contentWidth - 32) / 2;
  drawKeyValue(doc, "Waste Category", wasteCategory, PAGE_MARGIN + 16, innerY);
  drawKeyValue(doc, "Recyclability", recyclability, PAGE_MARGIN + 16 + halfWidth, innerY);
  innerY += 34;
  drawKeyValue(doc, "Recommendation", recommendation, PAGE_MARGIN + 16, innerY, contentWidth - 32);
  y += wasteHeight + 20;

  // --- Fabric Information card ---
  if (materialTypeInfo) {
    const descLines = doc.splitTextToSize(String(materialTypeInfo.description ?? "-"), contentWidth - 36);
    const infoHeight = 66 + descLines.length * 13;
    drawCard(doc, PAGE_MARGIN, y, contentWidth, infoHeight);
    let infoY = drawSectionHeading(doc, "Fabric Information", PAGE_MARGIN + 16, y + 24);
    drawKeyValue(doc, "Material Type", materialTypeInfo.type, PAGE_MARGIN + 16, infoY);
    drawKeyValue(doc, "Common Uses", materialTypeInfo.commonUses, PAGE_MARGIN + 16 + halfWidth, infoY);
    infoY += 34;
    drawKeyValue(doc, "Description", materialTypeInfo.description, PAGE_MARGIN + 16, infoY, contentWidth - 32);
    y += infoHeight + 20;
  }

  // --- Top 3 Predictions card ---
  if (top3Predictions.length > 0) {
    const top3Height = 32 + top3Predictions.length * 24 + 12;
    drawCard(doc, PAGE_MARGIN, y, contentWidth, top3Height);
    let rowY = drawSectionHeading(doc, "Top 3 Predictions", PAGE_MARGIN + 16, y + 24);
    const barX = PAGE_MARGIN + 150;
    const barWidth = contentWidth - 32 - 150 - 50;
    const rankColors = [COLORS.green, [67, 160, 71], [129, 199, 132]];

    top3Predictions.forEach((p, index) => {
      doc.setFontSize(10.5);
      doc.setFont("helvetica", "normal");
      setTextColor(doc, COLORS.dark);
      doc.text(String(p.material), PAGE_MARGIN + 16, rowY);
      drawProgressBar(doc, barX, rowY - 8, barWidth, 7, p.confidence, rankColors[index] || COLORS.green);
      doc.setFont("helvetica", "bold");
      setTextColor(doc, COLORS.gray);
      doc.text(`${p.confidence}%`, PAGE_MARGIN + contentWidth - 16, rowY, { align: "right" });
      rowY += 24;
    });
  }
}

/**
 * Stamps a consistent footer (divider line, brand name, "Page X of Y") on
 * every page of the document. Must be called AFTER all pages have been
 * added, since the total page count isn't known until then.
 */
function finalizeDocument(doc) {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 28;

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);

    setDraw(doc, COLORS.border);
    doc.line(PAGE_MARGIN, footerY - 12, pageWidth - PAGE_MARGIN, footerY - 12);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    setTextColor(doc, COLORS.grayMuted);
    doc.text(BRAND_NAME, PAGE_MARGIN, footerY);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - PAGE_MARGIN, footerY, { align: "right" });
  }
}

/**
 * @param {Object} params
 * @param {File} params.imageFile - the original uploaded fabric image
 * @param {string} params.material
 * @param {number} params.confidence
 * @param {string} params.wasteCategory
 * @param {string} params.recyclability
 * @param {string} params.recommendation
 * @param {Array<{material: string, confidence: number}>} params.top3Predictions
 * @param {Object} [params.materialTypeInfo] - { type, commonUses, description }
 * @param {number} [params.processingTimeSeconds]
 * @param {string} [params.fileName] - output filename, defaults to a generated one
 */
export async function downloadPredictionPdf({
  imageFile,
  material,
  confidence,
  wasteCategory,
  recyclability,
  recommendation,
  top3Predictions = [],
  materialTypeInfo,
  processingTimeSeconds,
  fileName,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  await drawPredictionPage(doc, {
    imageFile,
    material,
    confidence,
    wasteCategory,
    recyclability,
    recommendation,
    top3Predictions,
    materialTypeInfo,
    processingTimeSeconds,
  });

  finalizeDocument(doc);
  doc.save(fileName || `fabric_prediction_${material.toLowerCase()}_${Date.now()}.pdf`);
}

/** Small stat card used on the batch report's cover page. */
function drawStatCard(doc, x, y, width, height, label, value) {
  setFill(doc, COLORS.greenLight);
  doc.roundedRect(x, y, width, height, 8, 8, "F");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.gray);
  doc.text(label.toUpperCase(), x + 14, y + 20);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.greenDark);
  doc.text(String(value), x + 14, y + 42);
}

/**
 * Generates ONE combined PDF covering every completed prediction in a batch:
 * a cover page with summary stat cards and an included-items list, followed
 * by one detail page per item (reusing the same layout as the single-item
 * report for visual consistency).
 *
 * @param {Array<Object>} items - each shaped like downloadPredictionPdf's params
 *   (imageFile, material, confidence, wasteCategory, recyclability,
 *   recommendation, top3Predictions, materialTypeInfo)
 * @param {Object} [summary] - optional aggregate stats for the cover page:
 *   { total, processed, avgConfidence, recyclableCount }
 * @param {string} [fileName]
 */
export async function downloadBatchPredictionsReport(items, summary = {}, fileName) {
  if (!items || items.length === 0) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  // --- Cover page ---
  let y = drawHeader(doc, { title: "Batch Prediction Report", subtitle: new Date().toLocaleString() });
  y += 8;

  // Summary stat cards, 4 across
  const cardGap = 14;
  const cardWidth = (contentWidth - cardGap * 3) / 4;
  const cardHeight = 58;
  const statCards = [
    ["Total Images", summary.total ?? items.length],
    ["Processed Images", summary.processed ?? items.length],
    ["Avg. Confidence", summary.avgConfidence != null ? `${summary.avgConfidence}%` : "-"],
    ["Recyclable Materials", summary.recyclableCount ?? "-"],
  ];
  statCards.forEach(([label, value], index) => {
    drawStatCard(doc, PAGE_MARGIN + index * (cardWidth + cardGap), y, cardWidth, cardHeight, label, value);
  });
  y += cardHeight + 32;

  // --- Included Predictions list ---
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  setTextColor(doc, COLORS.dark);
  doc.text("Included Predictions", PAGE_MARGIN, y);
  y += 20;

  const rowHeight = 26;
  const barX = PAGE_MARGIN + contentWidth - 150;
  const barWidth = 90;

  items.forEach((item, index) => {
    if (y + rowHeight > pageHeight - 60) {
      doc.addPage();
      y = PAGE_MARGIN;
    }

    if (index % 2 === 0) {
      setFill(doc, COLORS.grayLight);
      doc.rect(PAGE_MARGIN, y - 15, contentWidth, rowHeight, "F");
    }

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    setTextColor(doc, COLORS.gray);
    doc.text(`${index + 1}.`, PAGE_MARGIN + 8, y);

    doc.setFont("helvetica", "bold");
    setTextColor(doc, COLORS.dark);
    const label = item.fileName || item.material;
    const truncatedLabel = doc.splitTextToSize(String(label), 200)[0];
    doc.text(truncatedLabel, PAGE_MARGIN + 26, y);

    doc.setFont("helvetica", "normal");
    setTextColor(doc, COLORS.gray);
    doc.text(String(item.material), PAGE_MARGIN + 230, y);

    drawProgressBar(doc, barX, y - 7, barWidth, 6, item.confidence, COLORS.green);
    doc.setFont("helvetica", "bold");
    setTextColor(doc, COLORS.dark);
    doc.text(`${item.confidence}%`, PAGE_MARGIN + contentWidth, y, { align: "right" });

    y += rowHeight;
  });

  // --- One detail page per item ---
  for (let i = 0; i < items.length; i += 1) {
    doc.addPage();
    // eslint-disable-next-line no-await-in-loop
    await drawPredictionPage(doc, {
      ...items[i],
      headerSubtitle: `Item ${i + 1} of ${items.length}`,
    });
  }

  finalizeDocument(doc);
  doc.save(fileName || `batch_prediction_report_${Date.now()}.pdf`);
}