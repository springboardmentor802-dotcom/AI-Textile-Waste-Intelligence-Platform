
function todayDateStamp() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportHistoryToCsv(records, fileName) {
  if (!records || records.length === 0) return;
  const finalName = fileName || `prediction_history_${todayDateStamp()}.csv`;

  const headers = [
    "Material",
    "Confidence (%)",
    "Waste Category",
    "Recyclability",
    "Recommendation",
    "Date",
  ];
  const rows = records.map((r) => [
    r.material,
    r.confidence,
    r.waste_category,
    r.recyclability,
    r.recommendation,
    new Date(r.created_at).toLocaleString(),
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  );

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, finalName);
}

/** Requires: npm install xlsx */
export async function exportHistoryToExcel(records, fileName) {
  if (!records || records.length === 0) return;
  const finalName = fileName || `prediction_history_${todayDateStamp()}.xlsx`;

  const XLSX = await import("xlsx");
  const rows = records.map((r) => ({
    Material: r.material,
    "Confidence (%)": r.confidence,
    "Waste Category": r.waste_category,
    Recyclability: r.recyclability,
    Recommendation: r.recommendation,
    Date: new Date(r.created_at).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "History");
  XLSX.writeFile(workbook, finalName);
}

/** Requires: npm install jspdf jspdf-autotable */
export async function exportHistoryToPdf(records, fileName) {
  if (!records || records.length === 0) return;
  const finalName = fileName || `prediction_history_${todayDateStamp()}.pdf`;

  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(46, 125, 50);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Prediction History Report", 48, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleString(), 48, 54);

  autoTable(doc, {
    startY: 88,
    head: [["Material", "Confidence", "Waste Category", "Recyclability", "Date"]],
    body: records.map((r) => [
      r.material,
      `${r.confidence}%`,
      r.waste_category,
      r.recyclability,
      new Date(r.created_at).toLocaleString(),
    ]),
    headStyles: { fillColor: [232, 245, 233], textColor: [37, 100, 40], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 6 },
    alternateRowStyles: { fillColor: [248, 250, 247] },
    margin: { left: 48, right: 48 },
  });

  doc.save(finalName);
}