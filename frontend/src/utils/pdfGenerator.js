import { jsPDF } from "jspdf";

export const generatePDF = (result, imageNumber) => {

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("AI Textile Waste Intelligence Platform", 20, y);

    y += 12;

    doc.setFontSize(14);
    doc.text(`Fabric Analysis Report - Image ${imageNumber}`, 20, y);

    y += 10;

    doc.setFontSize(11);

    doc.text(
        `Generated On: ${new Date().toLocaleString()}`,
        20,
        y
    );

    y += 15;

    doc.setFontSize(14);
    doc.text("Prediction Summary", 20, y);

    y += 10;

    doc.setFontSize(12);

    doc.text(`Fabric Type : ${result.fabric_type}`, 20, y);

    y += 8;

    doc.text(
        `Confidence : ${result.confidence.toFixed(2)}%`,
        20,
        y
    );

    y += 8;

    doc.text(`Quality : ${result.quality}`, 20, y);

    y += 8;

    doc.text(`Reusability : ${result.reusability}`, 20, y);

    y += 8;

    doc.text(`Recyclability : ${result.recyclability}`, 20, y);

    y += 8;

    doc.text(
        `Recycling Method : ${result.recycling_method}`,
        20,
        y
    );

    y += 15;

    doc.setFontSize(14);
    doc.text("Recommended Products", 20, y);

    y += 10;

    doc.setFontSize(12);

    (result.recommended_products || []).forEach((item) => {

        doc.text(`• ${item}`, 25, y);

        y += 8;

    });

    y += 5;

    doc.setFontSize(14);
    doc.text("Environmental Impact", 20, y);

    y += 10;

    doc.setFontSize(12);

    const lines = doc.splitTextToSize(
        result.environmental_impact,
        170
    );

    doc.text(lines, 20, y);

    y += lines.length * 8 + 10;

    doc.setFontSize(10);

    doc.setTextColor(100);

    doc.text(
        "Generated using AI Textile Waste Intelligence Platform",
        20,
        y
    );

    doc.save(`Fabric_Report_Image_${imageNumber}.pdf`);

};