import React from "react";
import { useNavigate } from "react-router-dom";

const AnalysisResultCard = ({ result, onReset }) => {
  const navigate = useNavigate();

  if (!result || !result.prediction) return null;

  const { prediction, materialInfo, imageUrl, uploadedFile } = result;
  const confidence = prediction.confidenceScore || prediction.materialConfidence || 0;
  const recordId = result._id || prediction._id;

  const rawImageUrl = imageUrl || prediction?.imageUrl || "/placeholder.jpg";
  const fullImageUrl = rawImageUrl.startsWith("http")
    ? rawImageUrl
    : `http://localhost:5000${rawImageUrl}`;

  const preprocessedUrl = result.preprocessedImageUrl || result.preprocessedImagePath || prediction?.preprocessedImagePath || rawImageUrl;
  const fullPreprocessedUrl = preprocessedUrl.startsWith("http")
    ? preprocessedUrl
    : `http://localhost:5000${preprocessedUrl}`;

  // Determine color theme based on confidence percentage
  const getConfidenceBadgeStyle = (score) => {
    if (score >= 90) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (score >= 75) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    } else {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const getRecyclabilityBadge = (grade) => {
    switch (grade) {
      case "Green":
        return "bg-green-100 text-green-850 border-green-250";
      case "Yellow":
        return "bg-yellow-100 text-yellow-850 border-yellow-250";
      case "Orange":
        return "bg-amber-100 text-amber-850 border-amber-250";
      case "Red":
        return "bg-red-100 text-red-850 border-red-250";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formattedTimestamp = prediction.timestamp
    ? new Date(prediction.timestamp).toLocaleString()
    : new Date().toLocaleString();

  const handleRegisterBatch = () => {
    // Navigate to inventory with pre-filled state for the registration modal
    navigate("/inventory", {
      state: {
        prefillMaterial: prediction.predictedMaterial,
        fromAnalysis: true,
      },
    });
  };

  const handleViewReport = () => {
    if (recordId) {
      navigate(`/report/${recordId}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden transition-all duration-300">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              Analysis Completed
            </span>
            <span className="text-xs text-slate-400">ID: #{recordId?.substring(0, 10) || "LOCAL"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Textile Analysis & Prediction Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">Processed at {formattedTimestamp}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/report/${recordId}`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            View Enterprise PDF Report →
          </button>
          {onReset && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              Analyze Another
            </button>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Core Prediction Summary & Dual Image Inspection Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200/70">
          {/* Dual Image Inspection (Original Upload & OpenCV Visual) */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Dual Image Inspection (Original Upload & OpenCV Visual)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original Uploaded Image */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700">Original Upload</span>
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-inner group">
                  <img
                    src={fullImageUrl}
                    alt="Original Uploaded Sample"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-medium truncate flex justify-between items-center">
                    <span>{uploadedFile?.originalname || "Original Input"}</span>
                    <span className="text-[9px] text-blue-300 font-bold uppercase">Raw Input</span>
                  </div>
                </div>
              </div>

              {/* OpenCV Preprocessed Image */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700">OpenCV Preprocessed</span>
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-inner group">
                  <img
                    src={fullPreprocessedUrl}
                    alt="OpenCV Preprocessed Visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-medium truncate flex justify-between items-center">
                    <span>Feature Extraction</span>
                    <span className="text-[9px] text-emerald-300 font-bold uppercase">OpenCV</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Material Output & Confidence Score */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Detected Textile Composition
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {prediction.predictedMaterial}
                </h3>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${getConfidenceBadgeStyle(
                    confidence
                  )}`}
                >
                  {confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Analysis Completed: <span className="font-semibold text-slate-700">{formattedTimestamp}</span>
              </p>
            </div>

            {/* Waste and Recyclability summary row */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waste Stream</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{prediction.wasteCategory}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Cert: {prediction.wasteConfidence}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recyclability</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-base font-bold text-slate-800">{prediction.recyclabilityScore}%</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getRecyclabilityBadge(prediction.recyclabilityGrade)}`}>
                    {prediction.recyclabilityGrade}
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Classification Certainty</span>
                <span>{confidence}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
                ></div>
              </div>
            </div>

            {/* Top Predictions Bar / Alternatives */}
            {result.topPredictions && result.topPredictions.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-200/60">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Alternative Predictions</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {result.topPredictions.map((pred, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-2xs text-xs">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>{pred.material}</span>
                        <span>{pred.confidence}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-150 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pred.confidence}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions inside Prediction Block */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {recordId && (
                <button
                  type="button"
                  onClick={handleViewReport}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition text-xs sm:text-sm flex items-center space-x-2"
                >
                  <span>📋 View Detailed Report</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleRegisterBatch}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-700 font-semibold rounded-xl border border-slate-350 transition text-xs sm:text-sm"
              >
                + Log as Inventory Batch
              </button>
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 transition text-xs sm:text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Textile Image Analysis Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Fabric & Texture Analysis */}
          <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="text-base">🧶</span>
              <h4 className="text-sm font-bold text-slate-900">Fabric & Texture</h4>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Fabric Structure</p>
                <p className="text-slate-700 font-semibold mt-0.5">{result.fabricDetection || "Woven Structure"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Surface Texture</p>
                <p className="text-slate-650 mt-0.5 leading-relaxed">{result.textureAnalysis || "Consistent surface pattern."}</p>
              </div>
            </div>
          </div>

          {/* Color Analysis */}
          <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="text-base">🎨</span>
              <h4 className="text-sm font-bold text-slate-900">Color Palette</h4>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Dominant Colors</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {result.colorAnalysis?.dominantColors?.map((color, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 border border-slate-200 px-1.5 py-0.5 rounded-lg bg-white shadow-2xs">
                      <span className="w-3 h-3 rounded-full inline-block border border-slate-300" style={{ backgroundColor: color }}></span>
                      <span className="font-mono text-[9px] text-slate-650 font-bold">{color}</span>
                    </div>
                  )) || <span className="text-slate-500">None detected</span>}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Palette Details</p>
                <p className="text-slate-650 mt-0.5 leading-relaxed">{result.colorAnalysis?.paletteDescription || "No palette data."}</p>
              </div>
            </div>
          </div>

          {/* Damage & Contamination */}
          <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="text-base">🔍</span>
              <h4 className="text-sm font-bold text-slate-900">Diagnostics & Wear</h4>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Damage Detection</p>
                {result.damageDetection?.damageDetected ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-red-50 text-red-700 border border-red-200 font-semibold text-[10px]">
                    ⚠️ {result.damageDetection.damageType} ({result.damageDetection.damageSeverity} Severity)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-green-50 text-green-700 border border-green-200 font-semibold text-[10px]">
                    ✓ No Damage Detected
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Contamination Detection</p>
                {result.contaminationDetection?.contaminationDetected ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[10px]">
                    ⚠️ {result.contaminationDetection.contaminationType} ({result.contaminationDetection.contaminationSeverity} Severity)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-green-50 text-green-700 border border-green-200 font-semibold text-[10px]">
                    ✓ No Contaminants Detected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sustainability Intelligence & Life Cycle Assessment (LCA) Panel */}
        {(() => {
          const sust = result.sustainabilityAnalysis;
          const carbonSaved = Number(sust?.carbonSaved ?? sust?.carbon_saved ?? 0);
          const waterSaved = Number(sust?.waterSaved ?? sust?.water_saved ?? sust?.details?.waterSaved ?? 0);
          const wasteDiversion = Number(sust?.wasteDiversion ?? sust?.waste_diversion ?? 0);
          const resourceRecovery = Number(sust?.resourceRecovery ?? sust?.resource_recovery ?? 0);
          const sustainabilityScore = Number(sust?.sustainabilityScore ?? sust?.sustainability_score ?? prediction.recyclabilityScore ?? 0);
          const circularityScore = Number(sust?.details?.circularityContribution ?? sustainabilityScore);
          const performance = sust?.performance || (sustainabilityScore >= 80 ? "Excellent" : sustainabilityScore >= 65 ? "Good" : sustainabilityScore >= 50 ? "Average" : "Needs Improvement");
          const recommendationsList = result.recommendations || sust?.recommendations || [];

          return (
            <div className="bg-emerald-900/95 text-white p-6 sm:p-8 rounded-2xl border border-emerald-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Life Cycle Assessment (LCA) & Circular Performance
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                    Sustainability Intelligence Assessment
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-emerald-200">Rating:</span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                      performance === "Excellent"
                        ? "bg-emerald-400 text-slate-950"
                        : performance === "Good"
                        ? "bg-teal-300 text-slate-950"
                        : performance === "Average"
                        ? "bg-amber-300 text-slate-950"
                        : "bg-red-400 text-slate-950"
                    }`}
                  >
                    {performance} ({sustainabilityScore}/100)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Carbon Footprint */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">Carbon Footprint Saved</span>
                  <p className="text-2xl font-black text-white">{carbonSaved} <span className="text-sm font-normal text-emerald-300">kg CO₂e</span></p>
                  <p className="text-[10px] text-emerald-400">Avoided virgin manufacturing emissions</p>
                </div>

                {/* Water Savings */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">Water Savings</span>
                  <p className="text-2xl font-black text-white">{waterSaved.toLocaleString()} <span className="text-sm font-normal text-emerald-300">Liters</span></p>
                  <p className="text-[10px] text-emerald-400">Conserved freshwater in processing</p>
                </div>

                {/* Landfill Reduction Rate */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">Landfill Reduction Rate</span>
                  <p className="text-2xl font-black text-white">{wasteDiversion}%</p>
                  <p className="text-[10px] text-emerald-400">Diverted from landfill disposal</p>
                </div>

                {/* Resource Conservation */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">Resource Recovery Yield</span>
                  <p className="text-2xl font-black text-white">{resourceRecovery}%</p>
                  <p className="text-[10px] text-emerald-400">Yield efficiency of recovered fiber</p>
                </div>

                {/* Sustainability Score */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">Sustainability Score</span>
                  <p className="text-2xl font-black text-white">{sustainabilityScore} / 100</p>
                  <p className="text-[10px] text-emerald-400">Weighted circularity index</p>
                </div>

                {/* Circularity Score */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-800/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-300">Circularity Contribution</span>
                  <p className="text-2xl font-black text-white">{circularityScore} / 100</p>
                  <p className="text-[10px] text-emerald-400">Material circular economy score</p>
                </div>
              </div>

              {/* Action Recommendations with Priority & Benefit */}
              {recommendationsList && recommendationsList.length > 0 && (
                <div className="pt-2 border-t border-emerald-800/60 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Prioritized Action Recommendations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendationsList.map((rec, idx) => (
                      <div key={idx} className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/50 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{typeof rec === "object" ? rec.name : String(rec)}</span>
                          {typeof rec === "object" && rec.priority && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${rec.priority === "High" ? "bg-red-900/80 text-red-200 border border-red-700" : "bg-blue-900/80 text-blue-200 border border-blue-700"}`}>
                              {rec.priority} Priority
                            </span>
                          )}
                        </div>
                        {typeof rec === "object" && rec.reason && (
                          <p className="text-emerald-200 text-[11px] leading-normal">{rec.reason}</p>
                        )}
                        {typeof rec === "object" && rec.environmental_benefit && (
                          <p className="text-emerald-400 text-[10px] font-medium pt-1">🌱 {rec.environmental_benefit}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Professional Material Information Card */}
        {materialInfo && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-100/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Professional Material Dossier
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Category: {materialInfo.category || "Standard Textile Fiber"}
                </p>
              </div>
              <span className="px-3 py-1 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800">
                Recycling Readiness:{" "}
                <span className="text-blue-600">{materialInfo.recyclingReadiness || "High"}</span>
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Material Overview
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    {materialInfo.description ||
                      "Textile fiber identified by AI deep feature extraction."}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Recommended Circular Pathway
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 font-medium text-blue-950">
                    {materialInfo.recommendedPathway ||
                      "Mechanical shredding or chemical regeneration based on fiber composition."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Environmental Impact & Sustainability
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    {materialInfo.environmentalImpact ||
                      "Recycling diverts post-consumer waste from landfill and reduces carbon footprint."}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Handling & Sorting Guidelines
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-100 text-amber-950">
                    {materialInfo.handlingGuidelines ||
                      "Ensure batch is clean, dry, and free of heavy metallic contaminants before shredding."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResultCard;
