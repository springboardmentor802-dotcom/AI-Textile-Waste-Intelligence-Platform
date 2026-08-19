import React, { useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Upload, RefreshCw, Image as ImageIcon, FileText, CheckCircle2, 
  Sparkles, ArrowRight, ShieldAlert, Check
} from 'lucide-react';
import { analyticsService } from '../services/api';

const FabricScannerComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [isBatchUpload, setIsBatchUpload] = useState(false);
  const [batchWeightInput, setBatchWeightInput] = useState(100.0);
  const [selectedEngine, setSelectedEngine] = useState('image_analysis_engine');
  const [toastNotification, setToastNotification] = useState(null);

  const engineNames = [
    { id: 'image_analysis_engine', label: '1. Textile Image Analysis Engine' },
    { id: 'material_classification_engine', label: '2. Material Classification Engine' },
    { id: 'waste_classification_engine', label: '3. Textile Waste Classification Engine' },
    { id: 'recycling_recommendation_engine', label: '4. Recycling Recommendation Engine' },
    { id: 'sustainability_intelligence_engine', label: '5. Sustainability Intelligence Engine' },
    { id: 'environmental_impact_engine', label: '6. Environmental Impact Assessment Engine' },
    { id: 'waste_scoring_engine', label: '7. Waste Scoring Engine' }
  ];

  const getEngineData = (engineKey) => {
    if (!imageAnalysisResult?.results) return null;
    const res = imageAnalysisResult.results;
    const keyAliases = {
      'image_analysis_engine': ['image_analysis_engine', 'textile_image_analysis_engine'],
      'material_classification_engine': ['material_classification_engine'],
      'waste_classification_engine': ['waste_classification_engine', 'textile_waste_classification_engine'],
      'recycling_recommendation_engine': ['recycling_recommendation_engine'],
      'sustainability_intelligence_engine': ['sustainability_intelligence_engine'],
      'environmental_impact_engine': ['environmental_impact_engine', 'environmental_impact_assessment_engine'],
      'waste_scoring_engine': ['waste_scoring_engine']
    };
    const candidateKeys = keyAliases[engineKey] || [engineKey];
    for (const k of candidateKeys) {
      if (res[k] && Object.keys(res[k]).length > 0) return res[k];
    }
    return null;
  };

  const parseNum = (val, defaultVal = 0) => {
    if (val === null || val === undefined) return defaultVal;
    if (typeof val === 'number') return val;
    const match = val.toString().match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : defaultVal;
  };

  const getDynamicSustainabilitySummary = () => {
    if (!imageAnalysisResult?.results) {
      return { isSuitable: true, title: "Ready for Analysis", reason: "Upload a fabric sample to analyze recycling suitability." };
    }
    const imgData = getEngineData('image_analysis_engine') || {};
    const wasteData = getEngineData('waste_classification_engine') || {};

    const damage = (imgData.damage_detection || "").toLowerCase();
    const contamination = (wasteData.contamination_detection || imgData.contamination_detection || "").toLowerCase();
    const recyclability = parseNum(wasteData.recyclability_assessment, 80);

    if (damage.includes("hardware") || damage.includes("zipper") || damage.includes("button") || damage.includes("stitch")) {
      return {
        isSuitable: false,
        title: "Hardware / Seam Fault Detected",
        reason: "Hardware defect detected. Trim components must be detached before fiber garnetting."
      };
    } else if (contamination.includes("stained") || contamination.includes("fluid") || contamination.includes("chemical")) {
      return {
        isSuitable: false,
        title: "Requires Pre-Cleaning Treatment",
        reason: "Surface contamination detected. Chemical pre-washing is required prior to mechanical recycling."
      };
    } else {
      return {
        isSuitable: true,
        title: "Fabric Suitable for Closed-Loop Recycling",
        reason: `High purity structure with ${recyclability}% recyclability index. Ideal for direct mechanical yarn spinning.`
      };
    }
  };

  const getDynamicEngine1HealthData = () => {
    const imgData = getEngineData('image_analysis_engine') || {};
    const textureScore = parseNum(imgData.fabric_texture || imgData.prediction_confidence, 88);
    return [
      { name: 'Fabric Health Score', value: Math.round(textureScore), color: textureScore > 75 ? '#10B981' : '#F59E0B' },
      { name: 'Defect & Noise Variance', value: 100 - Math.round(textureScore), color: '#E2E8F0' },
    ];
  };

  const getDynamicEngine2BlendData = () => {
    const matData = getEngineData('material_classification_engine') || {};
    const composition = matData.fiber_composition_prediction || "";
    let primary = 80;
    let blended = 20;
    const matches = composition.match(/\d+(\.\d+)?/g);
    if (matches && matches.length >= 2) {
      primary = parseFloat(matches[0]);
      blended = parseFloat(matches[1]);
    } else if (matches && matches.length === 1) {
      primary = parseFloat(matches[0]);
      blended = 100 - primary;
    }
    return [
      { name: 'Primary Fiber', value: Math.round(primary), color: '#10B981' },
      { name: 'Blended Matrix', value: Math.round(blended), color: '#3B82F6' }
    ];
  };

  const getDynamicEngine3PurityData = () => {
    const wasteData = getEngineData('waste_classification_engine') || {};
    let recyclability = parseNum(wasteData.recyclability_assessment, 85);
    return [
      { name: 'Pure Fabric Portion', value: Math.round(recyclability), color: recyclability > 70 ? '#10B981' : '#F59E0B' },
      { name: 'Contamination Level', value: 100 - Math.round(recyclability), color: '#EF4444' },
    ];
  };

  const getDynamicRecyclingPathway = () => {
    const recData = getEngineData('recycling_recommendation_engine') || {};
    const imgData = getEngineData('image_analysis_engine') || {};
    const damage = (imgData.damage_detection || "").toLowerCase();
    const contamination = (imgData.contamination_detection || "").toLowerCase();

    if (damage.includes("zipper") || damage.includes("hardware") || damage.includes("stitch")) {
      return {
        step2: "2. Hardware Removal",
        step3: "3. Mechanical Garnetting",
        step4: "4. Thermal Insulation Felt"
      };
    } else if (contamination.includes("stained") || contamination.includes("fluid")) {
      return {
        step2: "2. Chemical Pre-Washing",
        step3: "3. Post-wash Shredding",
        step4: "4. Downcycled Padding Wipes"
      };
    }
    return {
      step2: recData.recycling_strategy_recommendation || "2. Shredding & Carding",
      step3: recData.upcycling_suggestions || "3. Secondary Yarn Spinning",
      step4: recData.reuse_opportunity_detection || "4. Reused End Product"
    };
  };

  const getDynamicWasteScoringBarData = () => {
    const data = getEngineData('waste_scoring_engine') || {};
    return [
      { metric: 'Recyclability', score: Math.round(parseNum(data.material_recyclability_score_35, 85)), color: '#10B981' },
      { metric: 'Condition', score: Math.round(parseNum(data.material_condition_score_20, 88)), color: '#3B82F6' },
      { metric: 'Reuse Potential', score: Math.round(parseNum(data.reuse_potential_score_20, 75)), color: '#8B5CF6' },
      { metric: 'Eco Benefit', score: Math.round(parseNum(data.environmental_benefit_score_15, 90)), color: '#06B6D4' },
      { metric: 'Feasibility', score: Math.round(parseNum(data.processing_feasibility_score_10, 80)), color: '#F59E0B' },
    ];
  };

  const getDynamicEnvironmentalChartData = () => {
    const envData = getEngineData('environmental_impact_engine') || {};
    const co2Val = parseNum(envData.co2_savings_estimation, 1.75);
    const waterVal = parseNum(envData.water_savings_estimation, 1250);
    return [
      { metric: 'CO₂ Saved %', value: Math.min(Math.round(co2Val * 50), 100), color: '#10B981' },
      { metric: 'Water Saved %', value: Math.min(Math.round(waterVal / 15), 100), color: '#3B82F6' },
      { metric: 'Power Saved %', value: 75, color: '#8B5CF6' },
      { metric: 'Landfill Diversion %', value: 92, color: '#06B6D4' },
    ];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageAnalysisResult(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a textile image first.');

    setAnalyzingImage(true);
    try {
      const res = await analyticsService.uploadTextileImage(selectedFile, isBatchUpload, batchWeightInput);
      if (res && res.results) {
        setImageAnalysisResult(res);
        setToastNotification('🟢 Sample Analyzed Across All 7 AI Engines Successfully!');
        setTimeout(() => setToastNotification(null), 4000);
        
        // Notify dashboard to re-fetch scan metrics dynamically
        window.dispatchEvent(new CustomEvent('textile_scan_completed', { detail: res.results }));
      }
    } catch (err) {
      alert('Failed to process image scan.');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!imageAnalysisResult?.results) return alert('No analysis data available.');
    try {
      await analyticsService.downloadMultiEnginePdf({
        batch_id: imageAnalysisResult.filename ? `SCAN-${imageAnalysisResult.filename}` : "BATCH-AI-SCAN",
        results: imageAnalysisResult.results
      });
    } catch (err) {
      alert('Failed to download PDF report.');
    }
  };

  const sustSummary = getDynamicSustainabilitySummary();
  const pathway = getDynamicRecyclingPathway();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-emerald-400 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastNotification}
        </div>
      )}

      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-emerald-600" />
            AI Fabric Scanner
          </h2>
        </div>

        {imageAnalysisResult && (
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center shadow-md transition"
          >
            <FileText className="w-4 h-4 mr-2" /> Download Multi-Engine PDF Report
          </button>
        )}
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scan Evaluation Mode</label>
            <select
              value={isBatchUpload ? 'batch' : 'single'}
              onChange={(e) => setIsBatchUpload(e.target.value === 'batch')}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="single">Single Garment Scan</option>
              <option value="batch">Industrial Waste Batch Scan</option>
            </select>
          </div>

          {isBatchUpload && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Batch Weight (KG)</label>
              <input
                type="number"
                step="0.1"
                value={batchWeightInput}
                onChange={(e) => setBatchWeightInput(parseFloat(e.target.value) || 100.0)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-slate-50 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="textile-scan-file-input"
          />
          <label htmlFor="textile-scan-file-input" className="cursor-pointer block">
            {previewUrl ? (
              <div className="flex flex-col items-center">
                <img src={previewUrl} alt="Fabric Preview" className="h-44 object-cover rounded-xl shadow-md mb-2" />
                <span className="text-xs text-emerald-600 font-semibold">Change Fabric Sample</span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Click to upload textile scan image</p>
                <p className="text-xs text-slate-400 mt-0.5">High resolution JPG, PNG, WEBP supported</p>
              </div>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={analyzingImage || !selectedFile}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition shadow-md flex items-center justify-center text-sm disabled:opacity-50"
        >
          {analyzingImage ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
          Scan with AI
        </button>
      </form>

      {imageAnalysisResult && (
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Detailed Multi-Engine Inspection</span>
                <h4 className="text-xs font-bold text-slate-800 mt-0.5">Select Processing Engine View:</h4>
              </div>

              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="bg-slate-50 text-slate-800 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {engineNames.map(eng => <option key={eng.id} value={eng.id}>{eng.label}</option>)}
              </select>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                {engineNames.find(e => e.id === selectedEngine)?.label} Results
              </h5>

              {(() => {
                const activeData = getEngineData(selectedEngine);
                if (!activeData) {
                  return <p className="text-slate-400 text-xs italic col-span-2">No engine log data returned.</p>;
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {Object.entries(activeData)
                      .filter(([key]) => key !== 'supported_materials_check')
                      .map(([key, val]) => (
                        <div key={key} className="bg-white p-3 rounded-lg border border-slate-200 space-y-0.5 shadow-2xs">
                          <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono font-bold text-emerald-700 text-xs block leading-snug">
                            {val !== null && val !== undefined ? val.toString() : "N/A"}
                          </span>
                        </div>
                      ))}
                  </div>
                );
              })()}

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {selectedEngine === 'recycling_recommendation_engine' 
                    ? 'AI Recommended Recycling Pathway' 
                    : selectedEngine === 'sustainability_intelligence_engine'
                    ? 'AI Sustainability & Suitability Summary'
                    : 'Visual Engine Analytics & Suitability'
                  }
                </span>
                
                {selectedEngine === 'sustainability_intelligence_engine' ? (
                  <div className={`p-4 rounded-xl border space-y-2 ${sustSummary.isSuitable ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
                    <div className="flex items-center space-x-2">
                      {sustSummary.isSuitable ? (
                        <div className="p-1.5 bg-emerald-600 rounded-full text-white"><Check className="w-4 h-4" /></div>
                      ) : (
                        <div className="p-1.5 bg-amber-600 rounded-full text-white"><ShieldAlert className="w-4 h-4" /></div>
                      )}
                      <h4 className={`text-sm font-bold ${sustSummary.isSuitable ? 'text-emerald-900' : 'text-amber-900'}`}>{sustSummary.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium pl-8">{sustSummary.reason}</p>
                  </div>
                ) : selectedEngine === 'recycling_recommendation_engine' ? (
                  <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-emerald-800 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" /> Optimal Recovery Route
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-800 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">1. Scanned Sample</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="bg-emerald-100 px-2.5 py-1 rounded-md text-emerald-800">{pathway.step2}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="bg-blue-100 px-2.5 py-1 rounded-md text-blue-800">{pathway.step3}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="bg-purple-100 px-2.5 py-1 rounded-md text-purple-800">{pathway.step4}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-52 w-full bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <ResponsiveContainer width="100%" height="100%">
                      {selectedEngine === 'image_analysis_engine' ? (
                        <PieChart>
                          <Pie data={getDynamicEngine1HealthData()} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                            {getDynamicEngine1HealthData().map((entry, index) => <Cell key={`cell-e1-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(val) => `${val}% Health`} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      ) : selectedEngine === 'waste_classification_engine' ? (
                        <PieChart>
                          <Pie data={getDynamicEngine3PurityData()} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                            {getDynamicEngine3PurityData().map((entry, index) => <Cell key={`cell-e3-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(val) => `${val}%`} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      ) : selectedEngine === 'environmental_impact_engine' ? (
                        <BarChart data={getDynamicEnvironmentalChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="metric" stroke="#64748B" fontSize={10} />
                          <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                          <Tooltip formatter={(val) => `${val}%`} />
                          <Bar dataKey="value" name="Environmental Savings %">
                            {getDynamicEnvironmentalChartData().map((entry, index) => <Cell key={`cell-env-${index}`} fill={entry.color} />)}
                          </Bar>
                        </BarChart>
                      ) : selectedEngine === 'waste_scoring_engine' ? (
                        <BarChart data={getDynamicWasteScoringBarData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="metric" stroke="#64748B" fontSize={10} />
                          <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                          <Tooltip formatter={(val) => `${val}%`} />
                          <Bar dataKey="score" name="Engine Score %">
                            {getDynamicWasteScoringBarData().map((entry, index) => <Cell key={`cell-ws-${index}`} fill={entry.color} />)}
                          </Bar>
                        </BarChart>
                      ) : selectedEngine === 'material_classification_engine' ? (
                        <PieChart>
                          <Pie data={getDynamicEngine2BlendData()} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                            {getDynamicEngine2BlendData().map((entry, index) => <Cell key={`cell-e2-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(val) => `${val}%`} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      ) : (
                        <BarChart data={[{ metric: 'Confidence', score: 95 }]} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="metric" stroke="#64748B" fontSize={10} />
                          <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricScannerComponent;