import { useState } from "react";
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
  const [dragActive, setDragActive] = useState(false);

  // ---------------------------------------------------------
  // FILE HANDLING
  // ---------------------------------------------------------

  const processFile = (selected) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setFile(selected);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(selected);

    setResult(null);
  };

  // ---------------------------------------------------------
  // COMPRESS IMAGE FOR REPORT STORAGE
  // ---------------------------------------------------------

  const compressImage = (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 500;
        const maxHeight = 500;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.7
          )
        );
      };

      img.src = dataUrl;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // ---------------------------------------------------------
  // ANALYSIS
  // ---------------------------------------------------------

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please choose a textile image.");
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

      const data = response.data.data;

      // Display AI result
      setResult(data);

      // ---------------------------------------------------------
      // SAVE REPORT
      // ---------------------------------------------------------

      try {
        const compressedImage = await compressImage(preview);

        saveReport({
          id: Date.now(),
          date: new Date().toLocaleString(),
          material: data.material,
          defect: data.defect,
          sustainability: data.sustainability_score,
          image: compressedImage,
          data: data,
        });
        window.dispatchEvent(new Event("reportsUpdated"));

        addNotification(
          "New AI report generated successfully."
        );

      } catch (storageError) {
        console.error(
          "Report storage error:",
          storageError
        );

        addNotification(
          "AI analysis completed, but the report could not be saved.",
          "warning"
        );
      }

      addNotification(
        "AI Analysis completed successfully."
      );

      if (data.sustainability_score < 70) {
        addNotification(
          "Low sustainability score detected.",
          "warning"
        );
      }

    } catch (error) {
      console.error(
        "AI Analysis Error:",
        error
      );

      alert(
        "Analysis failed. Please check the backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // PRINT
  // ---------------------------------------------------------

  const handlePrint = () => {
    window.print();
  };

  // ---------------------------------------------------------
  // PDF
  // ---------------------------------------------------------

  const handleDownload = () => {
    if (!result) return;

    const pdf = new jsPDF();

    pdf.setFontSize(22);

    pdf.text(
      "AI Textile Intelligence Report",
      15,
      20
    );

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

        [
          "Material Confidence",
          `${result.material_confidence}%`,
        ],

        ["Defect", result.defect],

        [
          "Defect Confidence",
          `${result.defect_confidence}%`,
        ],

        ["Condition", result.condition],

        ["Waste Category", result.waste_category],

        ["Reuse Potential", result.reuse_potential],

        [
          "Processing Recommendation",
          result.processing_recommendation,
        ],

        [
          "Recyclability",
          result.recyclability,
        ],

        [
          "Reuse",
          result.reuse,
        ],

        [
          "Sustainability Score",
          result.sustainability_score,
        ],

        [
          "Environmental Impact",
          result.environmental_impact,
        ],

        [
          "Environmental Impact Index",
          result.environmental_impact_score ??
            "N/A",
        ],

        [
          "Carbon Footprint",
          result.carbon_footprint,
        ],

        [
          "Carbon Footprint Index",
          result.carbon_footprint_score ??
            "N/A",
        ],

        [
          "Water Consumption",
          result.water_consumption,
        ],

        [
          "Water Consumption Index",
          result.water_consumption_score ??
            "N/A",
        ],

        [
          "Recyclability Score",
          result.recyclability_score ??
            "N/A",
        ],

        [
          "Circular Score",
          result.circular_score ??
            "N/A",
        ],

        [
          "Circular Pathway",
          result.circular_pathway ??
            "N/A",
        ],

        [
          "Processing Method",
          result.processing_method ??
            "N/A",
        ],

        [
          "Environmental Benefit",
          result.environmental_benefit ??
            "N/A",
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

    let y =
      pdf.lastAutoTable.finalY + 15;

    pdf.setFontSize(16);

    pdf.text(
      "AI Executive Summary",
      15,
      y
    );

    y += 10;

    pdf.setFontSize(11);

    const summary =
      result.report?.summary || "";

    pdf.text(
      pdf.splitTextToSize(
        summary,
        180
      ),
      15,
      y
    );

    pdf.save(
      "AI_Textile_Intelligence_Report.pdf"
    );
  };

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const sustainability =
    Number(
      result?.sustainability_score || 0
    );

  const circular =
    Number(
      result?.circular_score || 0
    );

  const materialConfidence =
    Number(
      result?.material_confidence || 0
    );

  const defectConfidence =
    Number(
      result?.defect_confidence || 0
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">

      <div className="max-w-7xl mx-auto p-5 md:p-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg">
              🤖
            </div>

            <div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                AI Textile Intelligence
              </h1>

              <p className="text-gray-500 mt-1">
                Intelligent material, defect, sustainability
                and circular economy analysis
              </p>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* AI PIPELINE */}
        {/* ================================================= */}

        <div className="bg-white border shadow-sm rounded-2xl p-5 mb-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <PipelineStep
              number="01"
              icon="🧵"
              title="Material"
              text="Identify fabric"
              active
            />

            <PipelineStep
              number="02"
              icon="🔍"
              title="Defect"
              text="Inspect condition"
              active
            />

            <PipelineStep
              number="03"
              icon="🌱"
              title="Sustainability"
              text="Evaluate impact"
              active
            />

            <PipelineStep
              number="04"
              icon="♻️"
              title="Circularity"
              text="Recommend pathway"
              active
            />

          </div>

        </div>


        {/* ================================================= */}
        {/* UPLOAD + PREVIEW */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-7">

          {/* LEFT - PREVIEW */}

          <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl border overflow-hidden">

            <div className="p-6 border-b">

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Textile Image
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Upload a clear fabric image for AI analysis
                  </p>

                </div>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  AI READY
                </span>

              </div>

            </div>

            <div className="p-6">

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}

                onDragLeave={() => {
                  setDragActive(false);
                }}

                onDrop={handleDrop}

                className={`relative min-h-[390px] rounded-2xl border-2 border-dashed flex items-center justify-center transition ${
                  dragActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >

                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {preview ? (

                  <div className="w-full h-full p-4">

                    <div className="relative">

                      <img
                        src={preview}
                        alt="Selected textile"
                        className="w-full h-[350px] object-contain rounded-xl bg-white border"
                      />

                      <label
                        htmlFor="file-upload"
                        className="absolute bottom-4 right-4 bg-white/95 shadow-lg border px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      >
                        Change Image
                      </label>

                    </div>

                  </div>

                ) : (

                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-center p-10"
                  >

                    <div className="w-20 h-20 mx-auto bg-green-100 text-green-700 rounded-2xl flex items-center justify-center text-4xl">
                      🧵
                    </div>

                    <h3 className="text-xl font-bold mt-5 text-gray-800">
                      Upload Textile Image
                    </h3>

                    <p className="text-gray-500 mt-2">
                      Drag & drop your image here
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      or click to browse
                    </p>

                    <div className="mt-5 inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-700 transition">
                      Choose Image
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      Supported: JPG, PNG, WEBP
                    </p>

                  </label>

                )}

              </div>


              {file && (

                <div className="mt-4 flex items-center justify-between bg-gray-50 border rounded-xl p-4">

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                      🖼️
                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold text-gray-800 truncate">
                        {file.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>

                    </div>

                  </div>

                  <span className="text-green-600 text-sm font-semibold">
                    Ready
                  </span>

                </div>

              )}


              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className={`w-full mt-5 py-4 rounded-xl font-bold text-lg transition shadow-lg ${
                  !file || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl"
                }`}
              >

                {loading
                  ? "🤖 AI is analyzing..."
                  : "🚀 Analyze Textile with AI"}

              </button>

            </div>

          </div>


          {/* RIGHT - WHAT AI DOES */}

          <div className="lg:col-span-2 space-y-5">

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl shadow-xl p-7">

              <p className="text-green-400 text-sm font-bold uppercase tracking-wider">
                AI Analysis Engine
              </p>

              <h2 className="text-2xl font-extrabold mt-2">
                One Image.
                <br />
                Complete Intelligence.
              </h2>

              <p className="text-gray-300 mt-4 leading-7 text-sm">
                The platform combines material recognition,
                defect detection, waste classification,
                sustainability assessment and circular economy
                recommendations.
              </p>

              <div className="space-y-4 mt-7">

                <MiniFeature
                  icon="🧵"
                  title="Material Recognition"
                  text="Identifies the textile class and surface."
                />

                <MiniFeature
                  icon="🔍"
                  title="Defect Detection"
                  text="Evaluates the physical condition."
                />

                <MiniFeature
                  icon="🌱"
                  title="Sustainability"
                  text="Generates environmental indicators."
                />

                <MiniFeature
                  icon="♻️"
                  title="Circular Economy"
                  text="Suggests the best recovery pathway."
                />

              </div>

            </div>


            <div className="bg-white rounded-3xl shadow-lg border p-6">

              <h3 className="font-bold text-gray-900">
                💡 Analysis Workflow
              </h3>

              <div className="mt-5 space-y-4">

                <Workflow
                  number="1"
                  text="Upload textile image"
                />

                <Workflow
                  number="2"
                  text="AI identifies material"
                />

                <Workflow
                  number="3"
                  text="AI evaluates defect"
                />

                <Workflow
                  number="4"
                  text="Generate sustainability profile"
                />

                <Workflow
                  number="5"
                  text="Recommend circular strategy"
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (

          <div className="mt-8 bg-white rounded-3xl shadow-lg border p-8">

            <div className="text-center">

              <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />

              <h2 className="text-2xl font-bold mt-5">
                AI is analyzing your textile
              </h2>

              <p className="text-gray-500 mt-2">
                Running material, defect, sustainability
                and circular economy analysis...
              </p>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

              <LoadingStep
                icon="🧵"
                text="Material Recognition"
              />

              <LoadingStep
                icon="🔍"
                text="Defect Detection"
              />

              <LoadingStep
                icon="🌱"
                text="Sustainability"
              />

              <LoadingStep
                icon="♻️"
                text="Circularity"
              />

            </div>

          </div>

        )}


        {/* ================================================= */}
        {/* RESULTS */}
        {/* ================================================= */}

        {result && !loading && (

          <div className="mt-10 space-y-7">

            {/* RESULT HEADER */}

            <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-3xl shadow-xl text-white p-7">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div>

                  <p className="text-green-100 text-sm uppercase tracking-wider font-semibold">
                    Analysis Complete
                  </p>

                  <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
                    AI Textile Analysis Report
                  </h2>

                  <p className="text-green-50 mt-2">
                    {result.material} • {result.surface}
                  </p>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={handlePrint}
                    className="bg-white/15 border border-white/30 px-5 py-3 rounded-xl font-semibold hover:bg-white/25 transition"
                  >
                    🖨 Print
                  </button>

                  <button
                    onClick={handleDownload}
                    className="bg-white text-green-700 px-5 py-3 rounded-xl font-bold hover:bg-green-50 transition"
                  >
                    ⬇ PDF Report
                  </button>

                </div>

              </div>

            </div>


            {/* MAIN SCORES */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

              <ScoreCard
                title="Sustainability"
                value={sustainability}
                icon="🌱"
                description="Overall sustainability performance"
                type="green"
              />

              <ScoreCard
                title="Circular Economy"
                value={circular}
                icon="♻️"
                description="Circular recovery potential"
                type="purple"
              />

              <ScoreCard
                title="Material Confidence"
                value={materialConfidence}
                icon="🧵"
                description="AI material prediction confidence"
                type="blue"
              />

              <ScoreCard
                title="Defect Confidence"
                value={defectConfidence}
                icon="🔍"
                description="AI defect prediction confidence"
                type="orange"
              />

            </div>


            {/* MATERIAL + DEFECT */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

              <ResultSection
                title="🧵 Material Intelligence"
                subtitle="AI fabric identification"
              >

                <div className="grid grid-cols-2 gap-4">

                  <InfoBox
                    title="Material"
                    value={result.material}
                  />

                  <InfoBox
                    title="Surface"
                    value={result.surface}
                  />

                  <InfoBox
                    title="Confidence"
                    value={`${materialConfidence}%`}
                  />

                  <InfoBox
                    title="Recyclability"
                    value={result.recyclability}
                  />

                </div>

              </ResultSection>


              <ResultSection
                title="🔍 Defect & Waste Intelligence"
                subtitle="Condition and recovery assessment"
              >

                <div className="grid grid-cols-2 gap-4">

                  <InfoBox
                    title="Defect"
                    value={result.defect}
                  />

                  <InfoBox
                    title="Condition"
                    value={result.condition}
                  />

                  <InfoBox
                    title="Waste Category"
                    value={result.waste_category}
                  />

                  <InfoBox
                    title="Priority"
                    value={result.priority}
                  />

                </div>

              </ResultSection>

            </div>


            {/* ENVIRONMENTAL PROFILE */}

            <ResultSection
              title="🌍 Environmental Profile"
              subtitle="Rule-based sustainability indicators for the identified material"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <MetricBar
                  title="Environmental Impact Index"
                  value={result.environmental_impact_score}
                  label={result.environmental_impact}
                  description="Lower is better"
                  color="green"
                />

                <MetricBar
                  title="Carbon Footprint Index"
                  value={result.carbon_footprint_score}
                  label={result.carbon_footprint}
                  description="Lower is better"
                  color="orange"
                />

                <MetricBar
                  title="Water Consumption Index"
                  value={result.water_consumption_score}
                  label={result.water_consumption}
                  description="Lower is better"
                  color="blue"
                />

                <MetricBar
                  title="Recyclability Score"
                  value={result.recyclability_score}
                  label={result.recyclability}
                  description="Higher is better"
                  color="purple"
                />

              </div>

              <div className="mt-5 bg-gray-50 border rounded-xl p-4 text-sm text-gray-500">
                ℹ️ These are rule-based material indices, not measured
                real-world carbon emissions or water usage.
              </div>

            </ResultSection>


            {/* CIRCULAR ECONOMY */}

            <ResultSection
              title="♻️ Circular Economy Intelligence"
              subtitle="Recommended material recovery strategy"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                <InfoBox
                  title="Circular Score"
                  value={`${circular}/100`}
                  highlight
                />

                <InfoBox
                  title="Reuse Potential"
                  value={result.reuse_potential}
                />

                <InfoBox
                  title="Processing Method"
                  value={
                    result.processing_method ||
                    result.processing_recommendation
                  }
                />

                <InfoBox
                  title="Environmental Benefit"
                  value={
                    result.environmental_benefit ||
                    "N/A"
                  }
                />

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                  <p className="text-sm font-bold text-green-700 uppercase tracking-wide">
                    Recommended Pathway
                  </p>

                  <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                    {result.circular_pathway ||
                      result.circular_economy}
                  </h3>

                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">

                  <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                    Why this recommendation?
                  </p>

                  <p className="text-gray-700 mt-2 leading-7">
                    {result.circular_reason ||
                      result.circular_economy ||
                      "Recovery strategy generated from material and condition."}
                  </p>

                </div>

              </div>

            </ResultSection>


            {/* RECOMMENDATION */}

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl text-white p-8">

              <div className="flex items-start gap-5">

                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-3xl">
                  🤖
                </div>

                <div className="flex-1">

                  <p className="text-green-400 font-bold uppercase tracking-wider text-sm">
                    AI Recommendation
                  </p>

                  <h2 className="text-2xl font-extrabold mt-1">
                    Recommended Action
                  </h2>

                  <p className="text-gray-300 leading-7 mt-4">
                    Based on the identified{" "}
                    <strong className="text-white">
                      {result.material}
                    </strong>{" "}
                    and detected condition{" "}
                    <strong className="text-white">
                      {result.condition}
                    </strong>
                    , the recommended recovery strategy is{" "}
                    <strong className="text-green-400">
                      {result.recycling_recommendation}
                    </strong>
                    .
                  </p>

                  <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4">

                    <p className="text-gray-400 text-sm">
                      Circular Strategy
                    </p>

                    <p className="text-white font-semibold mt-1">
                      {result.circular_pathway ||
                        result.circular_economy}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* EXECUTIVE SUMMARY */}

            <div className="bg-white rounded-3xl shadow-lg border p-7">

              <div className="flex items-center gap-3 mb-5">

                <div className="bg-blue-100 text-blue-700 w-11 h-11 rounded-xl flex items-center justify-center text-xl">
                  📄
                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    AI Executive Summary
                  </h2>

                  <p className="text-sm text-gray-500">
                    Automatically generated analysis summary
                  </p>

                </div>

              </div>

              <p className="text-gray-700 leading-8 whitespace-pre-line">
                {result.report?.summary ||
                  "AI summary is not available for this analysis."}
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


/* ========================================================= */
/* PIPELINE */
/* ========================================================= */

function PipelineStep({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
        {number}
      </div>

      <div>

        <div className="font-bold text-gray-800">
          {icon} {title}
        </div>

        <p className="text-xs text-gray-500">
          {text}
        </p>

      </div>

    </div>
  );
}


/* ========================================================= */
/* MINI FEATURE */
/* ========================================================= */

function MiniFeature({
  icon,
  title,
  text,
}) {
  return (
    <div className="flex gap-3">

      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
        {icon}
      </div>

      <div>

        <p className="font-semibold">
          {title}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          {text}
        </p>

      </div>

    </div>
  );
}


/* ========================================================= */
/* WORKFLOW */
/* ========================================================= */

function Workflow({
  number,
  text,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
        {number}
      </div>

      <p className="text-sm text-gray-700">
        {text}
      </p>

    </div>
  );
}


/* ========================================================= */
/* LOADING */
/* ========================================================= */

function LoadingStep({
  icon,
  text,
}) {
  return (
    <div className="bg-gray-50 border rounded-xl p-4 flex items-center gap-3">

      <div className="text-xl animate-pulse">
        {icon}
      </div>

      <p className="text-sm font-semibold text-gray-600">
        {text}
      </p>

    </div>
  );
}


/* ========================================================= */
/* SCORE CARD */
/* ========================================================= */

function ScoreCard({
  title,
  value,
  icon,
  description,
  type,
}) {
  const themes = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      bar: "bg-green-600",
    },

    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      bar: "bg-purple-600",
    },

    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      bar: "bg-blue-600",
    },

    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      bar: "bg-orange-600",
    },
  };

  const theme = themes[type] || themes.green;

  return (
    <div
      className={`${theme.bg} ${theme.border} border rounded-2xl p-6`}
    >

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className={`text-4xl font-extrabold mt-2 ${theme.text}`}>
            {value}%
          </p>

        </div>

        <div className="text-3xl">
          {icon}
        </div>

      </div>

      <div className="mt-5 h-2 bg-white/80 rounded-full overflow-hidden">

        <div
          className={`${theme.bar} h-full rounded-full transition-all duration-700`}
          style={{
            width: `${Math.min(
              100,
              Math.max(0, value)
            )}%`,
          }}
        />

      </div>

      <p className="text-xs text-gray-500 mt-3">
        {description}
      </p>

    </div>
  );
}


/* ========================================================= */
/* RESULT SECTION */
/* ========================================================= */

function ResultSection({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border p-6 md:p-7">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>

      </div>

      {children}

    </div>
  );
}


/* ========================================================= */
/* INFO BOX */
/* ========================================================= */

function InfoBox({
  title,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p
        className={`text-xl font-bold mt-2 break-words ${
          highlight
            ? "text-green-700"
            : "text-gray-900"
        }`}
      >
        {value ?? "N/A"}
      </p>

    </div>
  );
}


/* ========================================================= */
/* METRIC BAR */
/* ========================================================= */

function MetricBar({
  title,
  value,
  label,
  description,
  color,
}) {
  const numericValue =
    value === undefined ||
    value === null
      ? null
      : Number(value);

  const colors = {
    green: "bg-green-600",
    orange: "bg-orange-500",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
  };

  return (
    <div className="border rounded-2xl p-5">

      <div className="flex justify-between gap-4">

        <div>

          <p className="font-bold text-gray-800">
            {title}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>

        </div>

        <div className="text-right">

          {numericValue !== null &&
          !Number.isNaN(numericValue) ? (

            <p className="text-xl font-extrabold">
              {numericValue}/100
            </p>

          ) : (

            <p className="text-xl font-extrabold">
              N/A
            </p>

          )}

          {label && (
            <p className="text-xs text-gray-500">
              {label}
            </p>
          )}

        </div>

      </div>

      <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">

        {numericValue !== null &&
          !Number.isNaN(numericValue) && (

          <div
            className={`${colors[color]} h-full rounded-full transition-all duration-700`}
            style={{
              width: `${Math.min(
                100,
                Math.max(0, numericValue)
              )}%`,
            }}
          />

        )}

      </div>

    </div>
  );
}


export default TextileIntelligence;