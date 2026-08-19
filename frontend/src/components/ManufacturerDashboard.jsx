import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Factory, Layers, RefreshCw, Upload, FileText, CheckCircle2, 
  Image as ImageIcon, Droplet, Box, Activity, TrendingUp, Award, 
  Recycle, Scissors, ShieldCheck, AlertCircle, Search, Package, Sparkles, ArrowRight, ShieldAlert, Check,
  LayoutDashboard
} from 'lucide-react';
import API, { analyticsService, inventoryService } from '../services/api';

const ManufacturerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [toastNotification, setToastNotification] = useState(null);

  // Dynamic Recovery Reports State
  const [recoveryYieldData, setRecoveryYieldData] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Inventory Logging Form State
  const [inventoryForm, setInventoryForm] = useState({
    batch_id: '',
    fabric_type: 'Cotton',
    source: 'Factory Pre-Consumer Scrap',
    quantity: 100.0,
    color: 'Navy Blue',
    condition: 'Good',
    collection_date: new Date().toISOString().split('T')[0]
  });
  const [registeringBatch, setRegisteringBatch] = useState(false);

  // AI Scanner State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [isBatchUpload, setIsBatchUpload] = useState(false);
  const [batchWeightInput, setBatchWeightInput] = useState(100.0);
  const [selectedEngine, setSelectedEngine] = useState('image_analysis_engine');

  const engineNames = [
    { id: 'image_analysis_engine', label: '1. Textile Image Analysis Engine' },
    { id: 'material_classification_engine', label: '2. Material Classification Engine' },
    { id: 'waste_classification_engine', label: '3. Textile Waste Classification Engine' },
    { id: 'recycling_recommendation_engine', label: '4. Recycling Recommendation Engine' },
    { id: 'sustainability_intelligence_engine', label: '5. Sustainability Intelligence Engine' },
    { id: 'environmental_impact_engine', label: '6. Environmental Impact Assessment Engine' },
    { id: 'waste_scoring_engine', label: '7. Waste Scoring Engine' }
  ];

  // Helper function to resolve active engine data dynamically across naming styles
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

  // Dynamic AI Sustainability Evaluation (Engine 5 & Global Card)
  const getDynamicSustainabilitySummary = () => {
    if (!imageAnalysisResult?.results) {
      return { isSuitable: true, title: "Ready for Analysis", reason: "Upload a fabric sample to analyze recycling suitability." };
    }

    const imgData = getEngineData('image_analysis_engine') || {};
    const wasteData = getEngineData('waste_classification_engine') || {};

    const damage = (imgData.damage_detection || "").toLowerCase();
    const contamination = (wasteData.contamination_detection || imgData.contamination_detection || "").toLowerCase();
    const recyclability = parseNum(wasteData.recyclability_assessment, 80);

    const hasHardwareDefect = damage.includes("hardware") || damage.includes("zipper") || damage.includes("button") || damage.includes("stitch");
    const hasStain = contamination.includes("stained") || contamination.includes("fluid") || contamination.includes("oil") || contamination.includes("chemical");

    if (hasHardwareDefect) {
      return {
        isSuitable: false,
        title: "Hardware / Seam Fault Detected",
        reason: "Hardware defect (zipper, metal trim or broken stitch) detected. Trim components must be detached before fiber garnetting."
      };
    } else if (hasStain) {
      return {
        isSuitable: false,
        title: "Requires Pre-Cleaning Treatment",
        reason: "Surface contamination or fluid stain detected. Chemical pre-washing is required prior to mechanical recycling."
      };
    } else {
      return {
        isSuitable: true,
        title: "Fabric Suitable for Closed-Loop Recycling",
        reason: `High purity structure with ${recyclability}% recyclability index. Ideal for direct mechanical garnetting and yarn spinning.`
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
      { name: 'Blended Composition', value: Math.round(blended), color: '#3B82F6' }
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
        step3: "3. Denim Garnetting",
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
      step3: recData.upcycling_suggestions || "3. Thermal Insulation Felt",
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

  // Fetch Recovery Reports
  const fetchDynamicRecoveryReports = async () => {
    setLoadingReports(true);
    try {
      const res = await API.get('/analytics/material-recovery-reports');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setRecoveryYieldData(res.data);
      } else {
        setRecoveryYieldData([
          { fabric: 'Cotton', generatedKg: 500, recoveredKg: 440, rate: 88, destination: 'Mechanical Fiber Shredding' },
          { fabric: 'Denim', generatedKg: 350, recoveredKg: 294, rate: 84, destination: 'Mechanical Fiber Shredding' },
          { fabric: 'Polyester', generatedKg: 400, recoveredKg: 320, rate: 80, destination: 'Chemical Depolymerization' },
          { fabric: 'Wool/Fleece', generatedKg: 200, recoveredKg: 168, rate: 84, destination: 'Mechanical Carding & Felting' },
        ]);
      }
    } catch (err) {
      console.error("Error fetching dynamic recovery reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchDynamicRecoveryReports();
  }, []);

  // Handle Waste Logging
  const handleRegisterWasteBatch = async (e) => {
    e.preventDefault();
    if (!inventoryForm.batch_id) return alert("Please specify a unique Batch ID.");
    setRegisteringBatch(true);

    try {
      await inventoryService.registerWaste(inventoryForm);
      setToastNotification(`🟢 Waste Batch #${inventoryForm.batch_id} logged successfully!`);
      setInventoryForm({
        ...inventoryForm,
        batch_id: '',
        quantity: 100.0
      });
      setTimeout(() => setToastNotification(null), 4000);
      fetchDynamicRecoveryReports();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to register waste batch.');
    } finally {
      setRegisteringBatch(false);
    }
  };

  // AI Scanner Handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageAnalysisResult(null);
    }
  };

  const handleImageUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert('Please select a fabric image first.');
    setAnalyzingImage(true);
    setImageAnalysisResult(null);

    try {
      const res = await analyticsService.uploadTextileImage(selectedFile, isBatchUpload, batchWeightInput);
      if (res && res.results) {
        setImageAnalysisResult(res);
        setToastNotification('🟢 Sample Analyzed Across All 7 AI Engines Successfully!');
        setTimeout(() => setToastNotification(null), 4000);
        fetchDynamicRecoveryReports();
      }
    } catch (err) {
      console.error("Fabric Upload Error Details:", err);
      const detailMsg = err.response?.data?.detail || err.message || 'Analysis failed.';
      alert(`Analysis Failed: ${detailMsg}`);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const totalScrapWeight = recoveryYieldData.reduce((a, b) => a + (b.generatedKg || 0), 0);
  const totalRecoveredWeight = recoveryYieldData.reduce((a, b) => a + (b.recoveredKg || 0), 0);

  const circularPotentialData = [
    { name: 'High Reuse', value: 45, color: '#10B981' },
    { name: 'Medium Reuse', value: 40, color: '#F59E0B' },
    { name: 'Low Reuse', value: 15, color: '#64748B' },
  ];

  const scoreComparisonData = [
    { analysis: 'Batch 1', circularScore: 65, sustainability: 60 },
    { analysis: 'Batch 2', circularScore: 68, sustainability: 62 },
    { analysis: 'Batch 3', circularScore: 72, sustainability: 70 },
    { analysis: 'Batch 4', circularScore: 80, sustainability: 75 },
    { analysis: 'Batch 5', circularScore: 82, sustainability: 82 },
  ];

  const sustSummary = getDynamicSustainabilitySummary();
  const pathway = getDynamicRecyclingPathway();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-emerald-400 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastNotification}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <nav className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'overview' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-3" /> Overview
            </button>

            <button
              onClick={() => setActiveTab('circular_insights')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'circular_insights' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Recycle className="w-4 h-4 mr-3" /> Circular economy insights
            </button>

            <button
              onClick={() => setActiveTab('recovery_reports')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'recovery_reports' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Box className="w-4 h-4 mr-3" /> Material recovery reports
            </button>

            <button
              onClick={() => setActiveTab('sustainability_performance')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'sustainability_performance' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 mr-3" /> Sustainability performance
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'scanner' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-3" /> AI Fabric Scanner
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Scissors className="w-5 h-5 mr-2 text-emerald-600" />
                    Daily Scrap Summary
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <span className="text-slate-500 text-xs font-semibold uppercase">Total Scrap</span>
                    <p className="text-2xl font-black text-slate-800">{totalScrapWeight} KG</p>
                    <span className="text-[11px] text-emerald-600 font-bold">Factory Output</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <span className="text-slate-500 text-xs font-semibold uppercase">Recovered Amount</span>
                    <p className="text-2xl font-black text-slate-800">{totalRecoveredWeight} KG</p>
                    <span className="text-[11px] text-blue-600 font-bold">Reusable Fiber</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                    <span className="text-slate-500 text-xs font-semibold uppercase">Efficiency Rate</span>
                    <p className="text-2xl font-black text-slate-800">
                      {totalScrapWeight > 0 ? ((totalRecoveredWeight / totalScrapWeight) * 100).toFixed(1) : '85.0'}%
                    </p>
                    <span className="text-[11px] text-purple-600 font-bold">Recovery Yield</span>
                  </div>
                </div>

                {/* Simplified Scrap Logging Form */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-emerald-600" />
                    Log New Scrap Batch
                  </h3>

                  <form onSubmit={handleRegisterWasteBatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Batch ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BATCH-101"
                        value={inventoryForm.batch_id}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, batch_id: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Fabric Type</label>
                      <select
                        value={inventoryForm.fabric_type}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, fabric_type: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Cotton">Cotton</option>
                        <option value="Denim">Denim</option>
                        <option value="Polyester">Polyester</option>
                        <option value="Wool">Wool</option>
                        <option value="Linen">Linen</option>
                        <option value="Silk">Silk</option>
                        <option value="Nylon">Nylon</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Weight (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={inventoryForm.quantity}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-3 pt-1">
                      <button
                        type="submit"
                        disabled={registeringBatch}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-md disabled:opacity-50"
                      >
                        {registeringBatch ? 'Saving Record...' : '+ Save Scrap Record'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CIRCULAR ECONOMY INSIGHTS */}
          {activeTab === 'circular_insights' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Recycle className="w-5 h-5 mr-2 text-emerald-600" />
                    Circular Economy Intelligence
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Score comparisons and reuse potential across analyzed factory batches.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Sustainability vs Circular Score</h3>
                      <p className="text-[11px] text-slate-400">Score comparison for each analysis batch</p>
                    </div>
                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="analysis" stroke="#64748B" fontSize={10} />
                          <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Bar dataKey="circularScore" name="Circular Score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="sustainability" name="Sustainability" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Circular Economy Potential</h3>
                      <p className="text-[11px] text-slate-400">Reuse potential across analyzed textiles</p>
                    </div>
                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={circularPotentialData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {circularPotentialData.map((entry, index) => (
                              <Cell key={`cell-potential-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => `${val}%`} />
                          <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border shadow-xs space-y-2 ${sustSummary.isSuitable ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${sustSummary.isSuitable ? 'text-emerald-700' : 'text-amber-800'}`}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Recommendation
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{sustSummary.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {sustSummary.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC MATERIAL RECOVERY REPORTS */}
          {activeTab === 'recovery_reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                      <Box className="w-5 h-5 mr-2 text-emerald-600" />
                      Fabric Recovery Summary
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Batch recovery yield and processing route breakdown.
                    </p>
                  </div>

                  <button
                    onClick={fetchDynamicRecoveryReports}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingReports ? 'animate-spin' : ''}`} /> Refresh Table
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                        <th className="py-3 px-4">Fabric</th>
                        <th className="py-3 px-4">Total Scrap</th>
                        <th className="py-3 px-4">Recovered</th>
                        <th className="py-3 px-4">Yield %</th>
                        <th className="py-3 px-4">Next Step</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {recoveryYieldData.length > 0 ? (
                        recoveryYieldData.map((row) => (
                          <tr key={row.fabric} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-bold text-slate-800">{row.fabric}</td>
                            <td className="py-3.5 px-4 font-medium">{row.generatedKg} KG</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-700">{row.recoveredKg} KG</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {row.rate}% Yield
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{row.destination}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                            No active waste records logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUSTAINABILITY PERFORMANCE */}
          {activeTab === 'sustainability_performance' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-emerald-600" />
                    Factory Eco Scorecard
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">High-level environmental impact and audit compliance summary.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">CO₂ Saved</span>
                    <p className="font-black text-slate-800 text-lg">{(totalScrapWeight * 3.2).toFixed(1)} KG</p>
                    <span className="text-[10px] text-emerald-600 font-bold block">🌱 Reduced Carbon Footprint</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Water Saved</span>
                    <p className="font-black text-slate-800 text-lg">{Math.round(totalScrapWeight * 1200).toLocaleString()} Liters</p>
                    <span className="text-[10px] text-blue-600 font-bold block">💧 Preserved Water Supply</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Eco Grade</span>
                    <p className="font-black text-slate-800 text-lg">Grade A (94/100)</p>
                    <span className="text-[10px] text-purple-600 font-bold block">🏆 High Sustainability Standard</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI FABRIC SCANNER */}
          {activeTab === 'scanner' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  Instant Fabric Scanner
                </h2>
                <p className="text-xs text-slate-500 mt-1">Upload fabric photo to run multi-engine diagnostics. Output text and visual charts update dynamically per selected engine.</p>
              </div>

              <form onSubmit={handleImageUploadAndAnalyze} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Scan Mode</label>
                    <select
                      value={isBatchUpload ? 'batch' : 'single'}
                      onChange={(e) => setIsBatchUpload(e.target.value === 'batch')}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="single">Single Sample Garment Scan</option>
                      <option value="batch">Industrial Cutting Batch Scan</option>
                    </select>
                  </div>

                  {isBatchUpload && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Batch Weight (KG)</label>
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

                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="manufacturer-fabric-upload"
                  />
                  <label htmlFor="manufacturer-fabric-upload" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="h-48 object-cover rounded-xl shadow-md mb-3" />
                        <span className="text-xs text-emerald-600 font-semibold">Change Sample Image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6">
                        <Upload className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-semibold text-slate-700">Click to upload fabric sample photo</p>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={analyzingImage || !selectedFile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-sm flex items-center justify-center text-sm disabled:opacity-50"
                >
                  {analyzingImage ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  {analyzingImage ? "Analyzing Fabric Sample..." : "Process Sample Across All 7 AI Engines"}
                </button>
              </form>

              {/* DYNAMIC MULTI-ENGINE INSPECTION */}
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

                    {/* ENGINE TEXT OUTPUT GRID */}
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

                      {/* ENGINE SPECIFIC VISUALS */}
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
          )}

        </main>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;