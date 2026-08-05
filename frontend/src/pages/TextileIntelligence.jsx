import { useState, useRef } from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveReport } from "../utils/reportStorage";
import { addNotification } from "../utils/notificationStorage";

function TextileIntelligence() {

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const reportRef = useRef(null);

    const handleFileChange = (e) => {

        if (e.target.files.length > 0) {

            const selected = e.target.files[0];

            setFile(selected);
            const reader = new FileReader();

            reader.onloadend = () => {

                setPreview(reader.result);

            };

            reader.readAsDataURL(selected);
            setResult(null);

        }

    };

    const handleAnalyze = async () => {

        if (!file) {

            alert("Please choose an image.");
            return;

        }

        const formData = new FormData();

        formData.append("file", file);

        try {

            setLoading(true);

            const response = await api.post(
                "/textile/analyze",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setResult(response.data.data);
            saveReport({

                id: Date.now(),

                date: new Date().toLocaleString(),

                material: response.data.data.material,

                defect: response.data.data.defect,

                sustainability: response.data.data.sustainability_score,

                image: preview,

                data: response.data.data,

            });
            addNotification(
                "AI Analysis completed successfully."
            );

            addNotification(
                "New AI report generated successfully."
            );

            if (response.data.data.sustainability_score < 70) {

                addNotification(
                    "Low sustainability score detected.",
                    "warning"
                );

            }

        } catch (err) {

            console.log(err);

            alert("Analysis Failed");

        } finally {

            setLoading(false);

        }

    };

    const handlePrint = () => {

        window.print();

    };

    const handleDownload = () => {

        if (!result) return;

        const pdf = new jsPDF();

        pdf.setFontSize(22);
        pdf.text("AI Textile Intelligence Report", 15, 20);

        pdf.setFontSize(10);

        pdf.text(
            `Generated : ${new Date().toLocaleString()}`,
            15,
            28
        );

        autoTable(pdf, {

            startY: 40,

            head: [["Field", "Prediction"]],

            body: [

                ["Material", result.material],

                ["Surface", result.surface],

                ["Material Confidence", `${result.material_confidence}%`],

                ["Defect", result.defect],

                ["Defect Confidence", `${result.defect_confidence}%`],

                ["Condition", result.condition],

                ["Waste Category", result.waste_category],

                ["Reuse Potential", result.reuse_potential],

                [
                    "Processing Recommendation",
                    result.processing_recommendation,
                ],

                ["Recyclability", result.recyclability],

                ["Reuse", result.reuse],

                [
                    "Sustainability Score",
                    result.sustainability_score,
                ],

                [
                    "Environmental Impact",
                    result.environmental_impact,
                ],

                [
                    "Carbon Footprint",
                    result.carbon_footprint,
                ],

                [
                    "Water Consumption",
                    result.water_consumption,
                ],

                [
                    "Recommendation",
                    result.recycling_recommendation,
                ],

                [
                    "Circular Economy",
                    result.circular_economy,
                ],

                [
                    "Eco Rating",
                    result.eco_rating,
                ],

            ],

        });

        let y = pdf.lastAutoTable.finalY + 15;

        pdf.setFontSize(16);

        pdf.text("AI Executive Summary", 15, y);

        y += 10;

        pdf.setFontSize(11);

        pdf.text(

            pdf.splitTextToSize(

                result.report?.summary || "",

                180

            ),

            15,

            y

        );

        pdf.save("AI_Textile_Intelligence_Report.pdf");

    };

    return (

        <div className="max-w-7xl mx-auto p-8">

            <h1 className="text-4xl font-bold mb-2">

                AI Textile Intelligence

            </h1>

            <p className="text-gray-500 mb-8">

                Upload one textile image to receive a complete AI-powered analysis.

            </p>

            <div className="bg-white rounded-xl shadow-lg p-8">

                <h2 className="text-2xl font-semibold mb-6">

                    Upload Fabric Image

                </h2>

                <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <label
                    htmlFor="file-upload"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer"
                >
                    Choose Image
                </label>

                {file ? (

                    <p className="mt-4 text-green-600 font-medium">

                        Selected : {file.name}

                    </p>

                ) : (

                    <p className="mt-4 text-gray-500">

                        No image selected

                    </p>

                )}

                {preview && (

                    <img
                        src={preview}
                        alt=""
                        className="mt-6 w-80 rounded-xl shadow border"
                    />

                )}

                <button
                    onClick={handleAnalyze}
                    className="mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                >
                    Analyze Image
                </button>

            </div>

            {loading && (

                <div className="mt-8 text-center">

                    <h2 className="text-blue-600 text-xl font-semibold">

                        AI is analyzing your fabric...

                    </h2>

                </div>

            )}

            {/* ---------- CONTINUE WITH PART 2 ---------- */}
            {result && (

                <div className="mt-10" ref={reportRef}>

                    <div className="flex justify-between items-center mb-6">

                        <h2 className="text-3xl font-bold">

                            AI Analysis Report

                        </h2>

                        <div className="flex gap-3">

                            <button
                                onClick={handlePrint}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                            >
                                🖨 Print
                            </button>

                            <button
                                onClick={handleDownload}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                            >
                                ⬇ Download Report
                            </button>

                        </div>

                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                        <Card title="Material" value={result.material} color="blue" />
                        <Card title="Surface" value={result.surface} color="blue" />

                        <Card
                            title="Material Confidence"
                            value={`${result.material_confidence}%`}
                            color="green"
                        />

                        <Card title="Defect" value={result.defect} color="red" />

                        <Card
                            title="Defect Confidence"
                            value={`${result.defect_confidence}%`}
                            color="green"
                        />

                        <Card
                            title="Waste Category"
                            value={result.waste_category}
                            color="yellow"
                        />

                        <Card
                            title="Condition"
                            value={result.condition}
                            color="purple"
                        />

                        <Card
                            title="Reuse Potential"
                            value={result.reuse_potential}
                            color="green"
                        />

                        <Card
                            title="Processing Recommendation"
                            value={result.processing_recommendation}
                            color="blue"
                        />

                        <Card
                            title="Recyclability"
                            value={result.recyclability}
                            color="green"
                        />

                        <Card
                            title="Reuse"
                            value={result.reuse}
                            color="yellow"
                        />

                        <Card
                            title="Sustainability Score"
                            value={result.sustainability_score}
                            color="green"
                        />

                        <Card
                            title="Environmental Impact"
                            value={result.environmental_impact}
                            color="red"
                        />

                        <Card
                            title="Carbon Footprint"
                            value={result.carbon_footprint}
                            color="gray"
                        />

                        <Card
                            title="Water Consumption"
                            value={result.water_consumption}
                            color="blue"
                        />

                        <Card
                            title="Recommendation"
                            value={result.recycling_recommendation}
                            color="green"
                        />

                        <Card
                            title="Circular Economy"
                            value={result.circular_economy}
                            color="purple"
                        />

                        <Card
                            title="Eco Rating"
                            value={result.eco_rating}
                            color="yellow"
                        />

                    </div>

                    <div className="mt-8 bg-white rounded-xl shadow-lg border p-6">

                        <h2 className="text-2xl font-bold mb-4">

                            AI Executive Summary

                        </h2>

                        <p className="text-gray-700 leading-8 whitespace-pre-line">

                            {result.report?.summary}

                        </p>

                    </div>

                </div>

            )}

        </div>

    );

}

function Card({ title, value, color }) {

    const colors = {
        blue: "bg-blue-50 border-blue-200",
        green: "bg-green-50 border-green-200",
        red: "bg-red-50 border-red-200",
        yellow: "bg-yellow-50 border-yellow-200",
        purple: "bg-purple-50 border-purple-200",
        gray: "bg-gray-50 border-gray-200",
    };

    return (

        <div
            className={`border rounded-xl shadow p-5 ${colors[color]}`}
        >

            <h3 className="text-gray-500 font-semibold">

                {title}

            </h3>

            <p className="text-2xl font-bold mt-3 break-words">

                {value}

            </p>

        </div>

    );

}

export default TextileIntelligence;