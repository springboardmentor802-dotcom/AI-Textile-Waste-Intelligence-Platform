import { jsPDF } from "jspdf";

// ============================================================================
// AI FABRIC INTELLIGENCE PLATFORM
// SIMPLE TABLE-BASED PDF REPORT
//
// PAGE 1
// - Green top bar
// - Prediction
// - Prediction Details
// - Material Information
//
// PAGE 2
// - NO "Sustainability Report" heading
// - NO subtitle
// - NO "Environmental and Circular Economy Analysis"
// - Top 3 Predictions
// - Environmental Impact
// - Recovery Recommendation
// - Circular Economy Score
// - Circularity Score Breakdown
//
// PAGE 3, ONLY IF REQUIRED
// - NO "Circularity Analysis" heading
// - Circularity Score Breakdown starts directly
//
// Removed:
// - Overall Sustainability
// - Environmental Status
// - Recommendation Status
// - Scoring Status
//
// Important:
// - Uses "CO2" instead of Unicode "CO₂" for jsPDF Helvetica.
// - Full-width tables only.
// - Long values wrap correctly.
// - A section is never cut at the bottom of a page.
// ============================================================================


// ============================================================================
// COLORS
// ============================================================================

const COLORS = {
  green: [46, 125, 50],
  greenDark: [35, 95, 40],

  dark: [35, 35, 35],
  gray: [90, 90, 90],
  grayLight: [245, 245, 245],

  border: [205, 205, 205],
  white: [255, 255, 255],
};


// ============================================================================
// PAGE SETTINGS
// ============================================================================

const PAGE_MARGIN = 42;

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

const FOOTER_HEIGHT = 42;

const CONTENT_WIDTH =
  PAGE_WIDTH - PAGE_MARGIN * 2;

const CONTENT_BOTTOM =
  PAGE_HEIGHT - FOOTER_HEIGHT;


// ============================================================================
// BASIC HELPERS
// ============================================================================

function safeString(value, fallback = "-") {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return fallback;
    }

    return value
      .map((item) => {
        if (
          item &&
          typeof item === "object"
        ) {
          return Object.values(item)
            .filter(
              (v) =>
                v !== null &&
                v !== undefined
            )
            .join(" - ");
        }

        return String(item);
      })
      .join(", ");
  }

  if (
    typeof value === "object"
  ) {
    return Object.values(value)
      .filter(
        (v) =>
          v !== null &&
          v !== undefined
      )
      .join(", ");
  }

  return String(value);
}


function formatNumber(
  value,
  decimals = 2
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toFixed(decimals);
}


function setTextColor(doc, color) {
  doc.setTextColor(
    color[0],
    color[1],
    color[2]
  );
}


function setFillColor(doc, color) {
  doc.setFillColor(
    color[0],
    color[1],
    color[2]
  );
}


function setDrawColor(doc, color) {
  doc.setDrawColor(
    color[0],
    color[1],
    color[2]
  );
}


// ============================================================================
// IMAGE TO DATA URL
// ============================================================================

function fileToDataUrl(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = reject;

      reader.readAsDataURL(file);
    }
  );
}


// ============================================================================
// PAGE 1 HEADER
// ============================================================================

function drawFirstPageHeader(
  doc,
  title,
  subtitle = ""
) {
  setFillColor(
    doc,
    COLORS.green
  );

  doc.rect(
    0,
    0,
    PAGE_WIDTH,
    72,
    "F"
  );

  setFillColor(
    doc,
    COLORS.greenDark
  );

  doc.rect(
    0,
    69,
    PAGE_WIDTH,
    3,
    "F"
  );

  setTextColor(
    doc,
    COLORS.white
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(17);

  doc.text(
    title,
    PAGE_MARGIN,
    30
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.text(
    "AI Fabric Intelligence Platform",
    PAGE_MARGIN,
    48
  );

  if (subtitle) {
    doc.text(
      subtitle,
      PAGE_WIDTH - PAGE_MARGIN,
      30,
      {
        align: "right",
      }
    );
  }

  return 94;
}


// ============================================================================
// PAGE 2 START
//
// IMPORTANT:
// There is intentionally NO title here.
// No "Sustainability Report"
// No subtitle
// No divider
// ============================================================================

function drawPageTwoTitle(doc) {
  return 42;
}


// ============================================================================
// SECTION TITLE
// ============================================================================

function drawSectionTitle(
  doc,
  title,
  y
) {
  setFillColor(
    doc,
    COLORS.green
  );

  doc.rect(
    PAGE_MARGIN,
    y - 9,
    4,
    16,
    "F"
  );

  setTextColor(
    doc,
    COLORS.dark
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.text(
    title,
    PAGE_MARGIN + 11,
    y + 2
  );

  return y + 19;
}


// ============================================================================
// TABLE ROW HEIGHT
// ============================================================================

function calculateRowHeight(
  doc,
  label,
  value,
  labelWidth,
  valueWidth
) {
  const fontSize = 8.5;

  doc.setFontSize(fontSize);

  const labelLines =
    doc.splitTextToSize(
      safeString(label),
      labelWidth - 12
    );

  const valueLines =
    doc.splitTextToSize(
      safeString(value),
      valueWidth - 12
    );

  const lineCount =
    Math.max(
      labelLines.length,
      valueLines.length
    );

  return Math.max(
    27,
    lineCount * 11 + 12
  );
}


// ============================================================================
// FULL WIDTH TWO-COLUMN TABLE
// ============================================================================

function drawTwoColumnTable(
  doc,
  rows,
  startY,
  options = {}
) {
  const x =
    options.x ??
    PAGE_MARGIN;

  const width =
    options.width ??
    CONTENT_WIDTH;

  const labelWidth =
    options.labelWidth ??
    165;

  const valueWidth =
    width - labelWidth;

  let y = startY;

  rows.forEach(
    (row, index) => {
      const label =
        safeString(
          row.label,
          ""
        );

      const value =
        safeString(
          row.value,
          "-"
        );

      const rowHeight =
        calculateRowHeight(
          doc,
          label,
          value,
          labelWidth,
          valueWidth
        );

      // Alternating background
      if (index % 2 === 0) {
        setFillColor(
          doc,
          COLORS.grayLight
        );

        doc.rect(
          x,
          y,
          width,
          rowHeight,
          "F"
        );
      }

      // Border
      setDrawColor(
        doc,
        COLORS.border
      );

      doc.setLineWidth(0.45);

      doc.rect(
        x,
        y,
        width,
        rowHeight
      );

      // Column divider
      doc.line(
        x + labelWidth,
        y,
        x + labelWidth,
        y + rowHeight
      );

      // Label
      setTextColor(
        doc,
        COLORS.gray
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8.5);

      const labelLines =
        doc.splitTextToSize(
          label,
          labelWidth - 12
        );

      doc.text(
        labelLines,
        x + 6,
        y + 15
      );

      // Value
      setTextColor(
        doc,
        COLORS.dark
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);

      const valueLines =
        doc.splitTextToSize(
          value,
          valueWidth - 12
        );

      doc.text(
        valueLines,
        x + labelWidth + 6,
        y + 15
      );

      y += rowHeight;
    }
  );

  return y;
}


// ============================================================================
// THREE-COLUMN TABLE
// ============================================================================

function drawThreeColumnTable(
  doc,
  rows,
  startY
) {
  const x =
    PAGE_MARGIN;

  const width =
    CONTENT_WIDTH;

  const columns = [
    {
      label: "Rank",
      width: 60,
    },

    {
      label: "Fabric",
      width: 300,
    },

    {
      label: "Confidence",
      width: width - 360,
    },
  ];

  const headerHeight = 27;

  let y = startY;

  // Header
  setFillColor(
    doc,
    COLORS.green
  );

  doc.rect(
    x,
    y,
    width,
    headerHeight,
    "F"
  );

  setTextColor(
    doc,
    COLORS.white
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8.5);

  let currentX = x;

  columns.forEach(
    (column, index) => {
      doc.text(
        column.label,
        currentX + 6,
        y + 17
      );

      if (
        index <
        columns.length - 1
      ) {
        setDrawColor(
          doc,
          COLORS.white
        );

        doc.line(
          currentX + column.width,
          y,
          currentX + column.width,
          y + headerHeight
        );
      }

      currentX +=
        column.width;
    }
  );

  y += headerHeight;

  // Rows
  rows.forEach(
    (row, index) => {
      const rowHeight = 27;

      if (index % 2 === 0) {
        setFillColor(
          doc,
          COLORS.grayLight
        );

        doc.rect(
          x,
          y,
          width,
          rowHeight,
          "F"
        );
      }

      setDrawColor(
        doc,
        COLORS.border
      );

      doc.rect(
        x,
        y,
        width,
        rowHeight
      );

      let cellX = x;

      columns.forEach(
        (
          column,
          columnIndex
        ) => {
          const value =
            safeString(
              row.values[columnIndex],
              "-"
            );

          setTextColor(
            doc,
            COLORS.dark
          );

          doc.setFont(
            "helvetica",
            columnIndex === 0
              ? "bold"
              : "normal"
          );

          doc.setFontSize(8.5);

          doc.text(
            value,
            cellX + 6,
            y + 17
          );

          if (
            columnIndex <
            columns.length - 1
          ) {
            doc.line(
              cellX + column.width,
              y,
              cellX + column.width,
              y + rowHeight
            );
          }

          cellX +=
            column.width;
        }
      );

      y += rowHeight;
    }
  );

  return y;
}


// ============================================================================
// SUSTAINABILITY DATA
// ============================================================================

function getSustainabilityData(
  sustainability
) {
  const data =
    sustainability || {};

  return {
    materialInformation:
      data.material_information ||
      {},

    environmentalImpact:
      data.environmental_impact ||
      {},

    recommendations:
      data.recommendations ||
      {},

    wasteScoring:
      data.waste_scoring ||
      {},

    overallSustainability:
      data.overall_sustainability ||
      "-",
  };
}


// ============================================================================
// FOOTER
// ============================================================================

function addFooter(doc) {
  const pageCount =
    doc.internal.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(page);

    setDrawColor(
      doc,
      COLORS.border
    );

    doc.setLineWidth(0.5);

    doc.line(
      PAGE_MARGIN,
      PAGE_HEIGHT - 31,
      PAGE_WIDTH - PAGE_MARGIN,
      PAGE_HEIGHT - 31
    );

    setTextColor(
      doc,
      COLORS.gray
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7.5);

    doc.text(
      "AI Fabric Intelligence Platform",
      PAGE_MARGIN,
      PAGE_HEIGHT - 17
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      PAGE_WIDTH - PAGE_MARGIN,
      PAGE_HEIGHT - 17,
      {
        align: "right",
      }
    );
  }
}


// ============================================================================
// PAGE SPACE CHECK
// ============================================================================

function sectionFits(
  currentY,
  requiredHeight
) {
  return (
    currentY +
      requiredHeight <=
    CONTENT_BOTTOM
  );
}


// ============================================================================
// PAGE 1
// ============================================================================

async function drawPageOne(
  doc,
  params
) {
  const {
    imageFile,
    material,
    confidence,
    defect,
    defectConfidence,
    wasteCategory,
    recyclability,
    recommendation,
    processingTimeSeconds,
    sustainability,
  } = params;

  let y =
    drawFirstPageHeader(
      doc,
      "AI Fabric Prediction Report",
      new Date().toLocaleString()
    );


  // ==========================================================================
  // IMAGE + MAIN PREDICTION
  // ==========================================================================

  const imageSize = 100;

  if (imageFile) {
    try {
      const imageData =
        await fileToDataUrl(
          imageFile
        );

      if (imageData) {
        setDrawColor(
          doc,
          COLORS.border
        );

        doc.rect(
          PAGE_MARGIN,
          y,
          imageSize,
          imageSize
        );

        const imageFormat =
          imageFile.type?.includes(
            "png"
          )
            ? "PNG"
            : "JPEG";

        doc.addImage(
          imageData,
          imageFormat,
          PAGE_MARGIN,
          y,
          imageSize,
          imageSize,
          undefined,
          "FAST"
        );

        const textX =
          PAGE_MARGIN +
          imageSize +
          20;

        setTextColor(
          doc,
          COLORS.gray
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(8.5);

        doc.text(
          "PREDICTED FABRIC",
          textX,
          y + 18
        );

        setTextColor(
          doc,
          COLORS.greenDark
        );

        doc.setFontSize(22);

        doc.text(
          safeString(
            material,
            "Unknown"
          ),
          textX,
          y + 43
        );

        setTextColor(
          doc,
          COLORS.dark
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(9.5);

        doc.text(
          `Confidence: ${formatNumber(
            confidence
          )}%`,
          textX,
          y + 64
        );

        if (
          processingTimeSeconds !==
          undefined
        ) {
          doc.text(
            `Processing Time: ${formatNumber(
              processingTimeSeconds
            )} sec`,
            textX,
            y + 82
          );
        }

        y +=
          imageSize +
          18;
      }
    } catch (error) {
      console.warn(
        "Unable to add image to PDF:",
        error
      );

      y += 10;
    }
  } else {
    setTextColor(
      doc,
      COLORS.gray
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8.5);

    doc.text(
      "PREDICTED FABRIC",
      PAGE_MARGIN,
      y + 18
    );

    setTextColor(
      doc,
      COLORS.greenDark
    );

    doc.setFontSize(22);

    doc.text(
      safeString(
        material,
        "Unknown"
      ),
      PAGE_MARGIN,
      y + 43
    );

    y += 65;
  }


  // ==========================================================================
  // PREDICTION DETAILS
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Prediction Details",
      y
    );

  y =
    drawTwoColumnTable(
      doc,
      [
        {
          label:
            "Predicted Fabric",
          value:
            material,
        },

        {
          label:
            "Model Confidence",
          value:
            confidence !==
            undefined
              ? `${formatNumber(
                  confidence
                )}%`
              : "-",
        },

        {
          label:
            "AI Processing Time",
          value:
            processingTimeSeconds !==
            undefined
              ? `${formatNumber(
                  processingTimeSeconds
                )} sec`
              : "-",
        },

        {
          label:
            "Defect",
          value:
            defect ||
            "No defect detected",
        },

        {
          label:
            "Defect Confidence",
          value:
            defectConfidence !==
            undefined
              ? `${formatNumber(
                  defectConfidence
                )}%`
              : "-",
        },

        {
          label:
            "Recyclability",
          value:
            recyclability ||
            "-",
        },

        {
          label:
            "Waste Category",
          value:
            wasteCategory ||
            "-",
        },

        {
          label:
            "Recovery Recommendation",
          value:
            recommendation ||
            "-",
        },
      ],
      y
    );

  y += 18;


  // ==========================================================================
  // MATERIAL INFORMATION
  // ==========================================================================

  const {
    materialInformation,
  } =
    getSustainabilityData(
      sustainability
    );

  y =
    drawSectionTitle(
      doc,
      "Material Information",
      y
    );

  drawTwoColumnTable(
    doc,
    [
      {
        label:
          "Fabric Class",
        value:
          materialInformation
            .fabric_class ||
          material ||
          "-",
      },

      {
        label:
          "Material Type",
        value:
          materialInformation
            .material_type ||
          "-",
      },

      {
        label:
          "Common Uses",
        value:
          materialInformation
            .common_uses ||
          "-",
      },

      {
        label:
          "Material Description",
        value:
          materialInformation
            .material_description ||
          "-",
      },

      {
        label:
          "Sustainability Notes",
        value:
          materialInformation
            .sustainability_notes ||
          "-",
      },

      {
        label:
          "Notes",
        value:
          materialInformation
            .notes ||
          "-",
      },
    ],
    y
  );
}


// ============================================================================
// PAGE 2
// ============================================================================

function drawPageTwo(
  doc,
  sustainability,
  top3Predictions = []
) {
  const {
    environmentalImpact,
    recommendations,
    wasteScoring,
  } =
    getSustainabilityData(
      sustainability
    );

  const scoreBreakdown =
    wasteScoring
      .score_breakdown ||
    {};

  // --------------------------------------------------------------------------
  // NO TITLE
  // NO SUBTITLE
  // NO "SUSTAINABILITY REPORT"
  // --------------------------------------------------------------------------

  let y = drawPageTwoTitle(doc);


  // ==========================================================================
  // TOP 3 PREDICTIONS
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Top 3 Predictions",
      y
    );

  const predictions =
    Array.isArray(
      top3Predictions
    )
      ? top3Predictions
      : [];

  const predictionRows =
    predictions
      .slice(0, 3)
      .map(
        (
          prediction,
          index
        ) => ({
          values: [
            index + 1,

            prediction.material ||
              prediction.fabric ||
              "-",

            prediction.confidence !==
            undefined
              ? `${formatNumber(
                  prediction.confidence
                )}%`
              : "-",
          ],
        })
      );

  if (
    predictionRows.length >
    0
  ) {
    y =
      drawThreeColumnTable(
        doc,
        predictionRows,
        y
      );
  } else {
    y =
      drawTwoColumnTable(
        doc,
        [
          {
            label:
              "Prediction Ranking",
            value:
              "No top predictions available.",
          },
        ],
        y
      );
  }

  y += 18;


  // ==========================================================================
  // ENVIRONMENTAL IMPACT
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Environmental Impact",
      y
    );

  y =
    drawTwoColumnTable(
      doc,
      [
        {
          // ASCII-safe: DO NOT use Unicode CO2 subscript
          label:
            "Estimated CO2 Saved",

          value:
            environmentalImpact
              .estimated_co2_saved_kg !==
              null &&
            environmentalImpact
              .estimated_co2_saved_kg !==
              undefined
              ? `${formatNumber(
                  environmentalImpact
                    .estimated_co2_saved_kg,
                  3
                )} kg`
              : "Unavailable",
        },

        {
          label:
            "Estimated Water Saved",

          value:
            environmentalImpact
              .estimated_water_saved_liters !==
              null &&
            environmentalImpact
              .estimated_water_saved_liters !==
              undefined
              ? `${formatNumber(
                  environmentalImpact
                    .estimated_water_saved_liters,
                  2
                )} liters`
              : "Unavailable",
        },

        {
          label:
            "Estimated Energy Saved",

          value:
            environmentalImpact
              .estimated_energy_saved_mj !==
              null &&
            environmentalImpact
              .estimated_energy_saved_mj !==
              undefined
              ? `${formatNumber(
                  environmentalImpact
                    .estimated_energy_saved_mj,
                  2
                )} MJ`
              : "Unavailable",
        },

        {
          label:
            "Estimated Landfill Diversion",

          value:
            environmentalImpact
              .estimated_landfill_diversion_kg !==
              null &&
            environmentalImpact
              .estimated_landfill_diversion_kg !==
              undefined
              ? `${formatNumber(
                  environmentalImpact
                    .estimated_landfill_diversion_kg,
                  3
                )} kg`
              : "Unavailable",
        },

        {
          label:
            "Environmental Score",

          value:
            environmentalImpact
              .environmental_score !==
              null &&
            environmentalImpact
              .environmental_score !==
              undefined
              ? `${environmentalImpact.environmental_score} / 100`
              : "Unavailable",
        },
      ],
      y
    );

  y += 18;


  // ==========================================================================
  // RECOVERY RECOMMENDATION
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Recovery Recommendation",
      y
    );

  const actions =
    recommendations
      .recommended_actions;

  let actionText = "-";

  if (
    Array.isArray(actions)
  ) {
    actionText =
      actions
        .map((action) =>
          safeString(action)
        )
        .join(", ");
  } else if (actions) {
    actionText =
      safeString(actions);
  }

  y =
    drawTwoColumnTable(
      doc,
      [
        {
          label:
            "Primary Method",

          value:
            recommendations
              .primary_method ||
            "-",
        },

        {
          label:
            "Recommended Actions",

          value:
            actionText,
        },

        {
          label:
            "Reuse Potential",

          value:
            recommendations
              .reuse_potential ||
            "-",
        },

        {
          label:
            "Waste Category",

          value:
            recommendations
              .waste_category ||
            "-",
        },
      ],
      y
    );

  y += 18;


  // ==========================================================================
  // CIRCULAR ECONOMY SCORE
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Circular Economy Score",
      y
    );

  y =
    drawTwoColumnTable(
      doc,
      [
        {
          label:
            "Circularity Score",

          value:
            wasteScoring
              .circularity_score !==
              null &&
            wasteScoring
              .circularity_score !==
              undefined
              ? `${wasteScoring.circularity_score} / 100`
              : "Unavailable",
        },

        {
          label:
            "Circularity Category",

          value:
            wasteScoring
              .circularity_category ||
            "-",
        },
      ],
      y
    );

  y += 18;


  // ==========================================================================
  // CIRCULARITY SCORE BREAKDOWN
  // ==========================================================================

  const breakdownRows = [
    {
      label:
        "Material Recyclability",

      value:
        scoreBreakdown
          .material_recyclability !==
          null &&
        scoreBreakdown
          .material_recyclability !==
          undefined
          ? scoreBreakdown
              .material_recyclability
          : "Unavailable",
    },

    {
      label:
        "Material Condition",

      value:
        scoreBreakdown
          .material_condition !==
          null &&
        scoreBreakdown
          .material_condition !==
          undefined
          ? scoreBreakdown
              .material_condition
          : "Unavailable",
    },

    {
      label:
        "Reuse Score",

      value:
        scoreBreakdown
          .reuse_score !==
          null &&
        scoreBreakdown
          .reuse_score !==
          undefined
          ? scoreBreakdown
              .reuse_score
          : "Unavailable",
    },

    {
      label:
        "Environmental Benefit",

      value:
        scoreBreakdown
          .environmental_benefit !==
          null &&
        scoreBreakdown
          .environmental_benefit !==
          undefined
          ? scoreBreakdown
              .environmental_benefit
          : "Unavailable",
    },

    {
      label:
        "Processing Feasibility",

      value:
        scoreBreakdown
          .processing_feasibility !==
          null &&
        scoreBreakdown
          .processing_feasibility !==
          undefined
          ? scoreBreakdown
              .processing_feasibility
          : "Unavailable",
    },
  ];


  // ==========================================================================
  // CHECK IF BREAKDOWN FITS
  // ==========================================================================

  const estimatedHeight =
    19 +
    breakdownRows.length *
      28;

  if (
    !sectionFits(
      y,
      estimatedHeight
    )
  ) {
    // ------------------------------------------------------------------------
    // PAGE 3
    //
    // IMPORTANT:
    // NO "Circularity Analysis"
    // NO extra title
    // NO subtitle
    // Start directly with section heading.
    // ------------------------------------------------------------------------

    doc.addPage();

    y = 42;
  }


  // ==========================================================================
  // CIRCULARITY SCORE BREAKDOWN TITLE
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Circularity Score Breakdown",
      y
    );


  // ==========================================================================
  // CIRCULARITY BREAKDOWN TABLE
  // ==========================================================================

  drawTwoColumnTable(
    doc,
    breakdownRows,
    y
  );
}


// ============================================================================
// DOWNLOAD SINGLE PREDICTION PDF
// ============================================================================

export async function downloadPredictionPdf({
  imageFile,
  material,
  confidence,
  defect,
  defectConfidence,
  wasteCategory,
  recyclability,
  recommendation,
  top3Predictions = [],
  materialTypeInfo,
  processingTimeSeconds,
  sustainability,
  fileName,
}) {
  const doc =
    new jsPDF({
      orientation:
        "portrait",

      unit: "pt",

      format: "a4",
    });


  // ==========================================================================
  // PAGE 1
  // ==========================================================================

  await drawPageOne(
    doc,
    {
      imageFile,

      material,

      confidence,

      defect,

      defectConfidence,

      wasteCategory,

      recyclability,

      recommendation,

      top3Predictions,

      materialTypeInfo,

      processingTimeSeconds,

      sustainability,
    }
  );


  // ==========================================================================
  // PAGE 2
  // ==========================================================================

  doc.addPage();

  drawPageTwo(
    doc,
    sustainability,
    top3Predictions
  );


  // ==========================================================================
  // FOOTER
  // ==========================================================================

  addFooter(doc);


  // ==========================================================================
  // FILE NAME
  // ==========================================================================

  const safeMaterial =
    safeString(
      material,
      "fabric"
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "_"
      );

  doc.save(
    fileName ||
      `fabric_prediction_${safeMaterial}_${Date.now()}.pdf`
  );
}


// ============================================================================
// BATCH PREDICTION REPORT
// ============================================================================

export async function downloadBatchPredictionsReport(
  items,
  summary = {},
  fileName
) {
  const predictions =
    Array.isArray(items)
      ? items
      : [];


  if (
    predictions.length ===
    0
  ) {
    console.warn(
      "No predictions available for batch PDF."
    );

    return;
  }


  const doc =
    new jsPDF({
      orientation:
        "portrait",

      unit: "pt",

      format: "a4",
    });


  // ==========================================================================
  // PAGE 1 HEADER
  // ==========================================================================

  let y =
    drawFirstPageHeader(
      doc,
      "Batch Fabric Prediction Report",
      new Date().toLocaleString()
    );


  // ==========================================================================
  // BATCH SUMMARY
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Batch Summary",
      y
    );

  y =
    drawTwoColumnTable(
      doc,
      [
        {
          label:
            "Total Predictions",

          value:
            summary.total ??
            predictions.length,
        },

        {
          label:
            "Processed Predictions",

          value:
            summary.processed ??
            predictions.length,
        },

        {
          label:
            "Average Confidence",

          value:
            summary.avgConfidence !==
            undefined
              ? `${formatNumber(
                  summary.avgConfidence
                )}%`
              : "-",
        },

        {
          label:
            "Recyclable Count",

          value:
            summary.recyclableCount ??
            "-",
        },
      ],
      y
    );

  y += 18;


  // ==========================================================================
  // BATCH RESULTS (OVERVIEW TABLE)
  // ==========================================================================

  y =
    drawSectionTitle(
      doc,
      "Prediction Results",
      y
    );

  const rows =
    predictions.map(
      (
        item,
        index
      ) => ({
        values: [
          index + 1,

          item.material ||
            "-",

          item.confidence !==
          undefined
            ? `${formatNumber(
                item.confidence
              )}%`
            : "-",
        ],
      })
    );


  drawThreeColumnTable(
    doc,
    rows,
    y
  );


  // ==========================================================================
  // PER-ITEM DETAIL PAGES
  //
  // Each item gets the SAME two-page layout as a single prediction report
  // (drawPageOne + drawPageTwo), so the combined batch PDF carries the full
  // defect / material / environmental / circularity detail instead of only
  // the material + confidence summary row above.
  // ==========================================================================

  for (
    let index = 0;
    index < predictions.length;
    index++
  ) {
    const item = predictions[index];

    doc.addPage();

    await drawPageOne(
      doc,
      {
        imageFile: item.imageFile,
        material: item.material,
        confidence: item.confidence,
        defect: item.defect,
        defectConfidence: item.defectConfidence,
        wasteCategory: item.wasteCategory,
        recyclability: item.recyclability,
        recommendation: item.recommendation,
        processingTimeSeconds: item.processingTimeSeconds,
        sustainability: item.sustainability,
      }
    );

    doc.addPage();

    drawPageTwo(
      doc,
      item.sustainability,
      item.top3Predictions
    );
  }


  // ==========================================================================
  // FOOTER
  // ==========================================================================

  addFooter(doc);


  // ==========================================================================
  // SAVE
  // ==========================================================================

  doc.save(
    fileName ||
      `batch_fabric_prediction_report_${Date.now()}.pdf`
  );
}


// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  downloadPredictionPdf,
  downloadBatchPredictionsReport,
};