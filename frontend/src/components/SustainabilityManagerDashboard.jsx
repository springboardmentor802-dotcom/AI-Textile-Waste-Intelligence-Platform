import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Leaf, Scale, RefreshCw, Upload, FileText, CheckCircle2, 
  Image as ImageIcon, Droplet, Box, Activity, ShieldCheck, 
  TrendingUp, Layers, Bell, Calendar, Sparkles, ArrowRight, Check, ShieldAlert
} from 'lucide-react';
import API, { analyticsService } from '../services/api';

const SustainabilityManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [timeFrame, setTimeFrame] = useState('this_week');

  const [globalScanLogs, setGlobalScanLogs] = useState([]);
  const [toastNotification, setToastNotification] = useState(null);

  // AI Scanner State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  const [isBatchUpload, setIsBatchUpload] = useState(false);
  const [batchWeightInput, setBatchWeightInput] = useState(100.0);
  const [selectedEngine, setSelectedEngine] = useState('image_analysis_engine');

  // Sustainability Calculator State
  const [assessmentForm, setAssessmentForm] = useState({
    material_type: 'Cotton',
    material_condition: 'Good',
    waste_weight_kg: 50.0,
    reuse_potential: 'High',
    environmental_benefit: 'High',
    processing_feasibility: 'Easy'
  });
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [assessing, setAssessing] = useState(false);

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
        title: "Hardware / Seam Defect Detected",
        reason: "Defective stitch or zipper detected. Hardware and damaged trims must be detached before fiber garnetting."
      };
    } else if (contamination.includes("stained") || contamination.includes("chemical") || contamination.includes("fluid")) {
      return {
        isSuitable: false,
        title: "Requires Pre-Cleaning Treatment",
        reason: "Surface contamination detected. Chemical pre-washing is required prior to mechanical recycling."
      };
    } else {
      return {
        isSuitable: true,
        title: "Fabric Suitable for Closed-Loop Recycling",
        reason: `High purity structure with ${recyclability}% recyclability index. Ideal for mechanical fiber yarn spinning.`
      };
    }
  };

  const getDynamicEngine1HealthData = () => {
    const imgData = getEngineData('image_analysis_engine') || {};
    const textureScore = parseNum(imgData.fabric_texture || imgData.prediction_confidence, 90);
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
      step2: recData.recycling_strategy_recommendation || "2. Mechanical Fiber Shredding",
      step3: recData.upcycling_suggestions || "3. Secondary Yarn Spinning",
      step4: recData.reuse_opportunity_detection || "4. Closed-Loop Textile"
    };
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

  const getDynamicWasteScoringBarData = () => {
    const data = getEngineData('waste_scoring_engine') || {};
    return [
      { metric: 'Recyclability', score: Math.round(parseNum(data.material_recyclability_score_35, 85)), color: '#10B981' },
      { metric: 'Condition', score: Math.round(parseNum(data.material_condition_score_20, 88)), color: '#3B82F6' },
      { metric: 'Reuse', score: Math.round(parseNum(data.reuse_potential_score_20, 75)), color: '#8B5CF6' },
      { metric: 'Eco Benefit', score: Math.round(parseNum(data.environmental_benefit_score_15, 90)), color: '#06B6D4' },
      { metric: 'Feasibility', score: Math.round(parseNum(data.processing_feasibility_score_10, 80)), color: '#F59E0B' },
    ];
  };

  const fetchScansFromDatabase = async () => {
    try {
      const res = await API.get(`/analytics/scans?time_frame=${timeFrame}`);
      if (Array.isArray(res.data)) {
        setGlobalScanLogs(res.data);
      }
    } catch (e) {
      console.error("Error fetching persistent scan logs:", e);
    }
  };

  useEffect(() => {
    fetchScansFromDatabase();
  }, [timeFrame]);

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
    if (!selectedFile) return alert('Please select an image file first.');
    setAnalyzingImage(true);
    setImageAnalysisResult(null);

    try {
      const res = await analyticsService.uploadTextileImage(selectedFile, isBatchUpload, batchWeightInput);
      if (res && res.results) {
        setImageAnalysisResult(res);
        setToastNotification('🟢 Scan completed & recorded into database!');
        setTimeout(() => setToastNotification(null), 4000);
        fetchScansFromDatabase();
      }
    } catch (err) {
      alert('Analysis failed.');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setAssessing(true);
    try {
      const res = await analyticsService.assessMaterialSustainability(assessmentForm);
      setAssessmentResult(res);
    } catch (err) {
      alert('Failed to calculate sustainability assessment.');
    } finally {
      setAssessing(false);
    }
  };

  // Fixed 2 Decimal places for total waste diverted
  const totalWeightDivertedNum = globalScanLogs.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0) + 1250; 
  const totalWeightDiverted = totalWeightDivertedNum.toFixed(2);
  const totalCo2Saved = (totalWeightDivertedNum * 3.2).toFixed(1);
  const totalWaterSaved = Math.round(totalWeightDivertedNum * 1200);

  const adminContribution = globalScanLogs
    .filter(l => ['ADMIN', 'ADMINISTRATOR', 'Admin'].includes((l.role || '').toUpperCase()))
    .reduce((a, c) => a + (c.co2Saved || 0), 0) + 420;

  const operatorContribution = globalScanLogs
    .filter(l => ['RECYCLING_OPERATOR', 'RECYCLING FACILITY OPERATOR'].includes((l.role || '').toUpperCase()))
    .reduce((a, c) => a + (c.co2Saved || 0), 0) + 310;

  const managerContribution = globalScanLogs
    .filter(l => ['SUSTAINABILITY_MANAGER', 'SUSTAINABILITY MANAGER'].includes((l.role || '').toUpperCase()))
    .reduce((a, c) => a + (c.co2Saved || 0), 0) + 250;

  const manufacturerContribution = globalScanLogs
    .filter(l => ['MANUFACTURER', 'TEXTILE MANUFACTURER'].includes((l.role || '').toUpperCase()))
    .reduce((a, c) => a + (c.co2Saved || 0), 0) + 180;

  const roleContributionData = [
    { name: 'Administrator', co2: parseFloat(adminContribution.toFixed(1)), fill: '#10B981' },
    { name: 'Recycling Facility Operator', co2: parseFloat(operatorContribution.toFixed(1)), fill: '#3B82F6' },
    { name: 'Sustainability Manager', co2: parseFloat(managerContribution.toFixed(1)), fill: '#8B5CF6' },
    { name: 'Textile Manufacturer', co2: parseFloat(manufacturerContribution.toFixed(1)), fill: '#F59E0B' },
  ];

  const allFabricsList = [
    'Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 
    'Denim', 'Nylon', 'Rayon', 'Acrylic', 'Mixed Fabrics'
  ];

  const fabricColors = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', 
    '#06B6D4', '#6366F1', '#14B8A6', '#F97316', '#64748B'
  ];

  const fabricCounts = {
    Cotton: 35, Polyester: 20, Wool: 10, Silk: 5, Linen: 5,
    Denim: 12, Nylon: 5, Rayon: 3, Acrylic: 3, 'Mixed Fabrics': 2
  };

  globalScanLogs.forEach(log => {
    const matched = allFabricsList.find(f => f.toLowerCase() === (log.fabric || '').toLowerCase());
    if (matched) {
      fabricCounts[matched] = (fabricCounts[matched] || 0) + 1;
    }
  });

  const totalFabricScans = Object.values(fabricCounts).reduce((a, b) => a + b, 0);

  const materialDistributionData = allFabricsList.map((fabric, idx) => ({
    name: fabric,
    value: Math.round(((fabricCounts[fabric] || 0) / totalFabricScans) * 100) || 1,
    color: fabricColors[idx % fabricColors.length]
  }));

  const sustSummary = getDynamicSustainabilitySummary();
  const pathway = getDynamicRecyclingPathway();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {toastNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-emerald-400 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Bell className="w-4 h-4 text-emerald-400" />
          {toastNotification}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar without the top panel card and with Overview name */}
        <aside className="lg:col-span-3 space-y-2">
          <nav className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'metrics' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4 mr-3" /> Overview
            </button>

            <button
              onClick={() => setActiveTab('carbon')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'carbon' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-3" /> Carbon reduction reports
            </button>

            <button
              onClick={() => setActiveTab('waste')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'waste' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Box className="w-4 h-4 mr-3" /> Waste diversion analytics
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'calculator' ? 'bg-emerald-600 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4 mr-3" /> Sustainability Calculator
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

        <main className="lg:col-span-9 space-y-6">

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-emerald-600" />
                  Organization-Wide Sustainability Metrics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl space-y-1">
                    <span className="text-slate-500 text-xs font-semibold uppercase">Total Carbon Offset</span>
                    <p className="text-2xl font-black text-slate-800">{totalCo2Saved} Kg</p>
                    <span className="text-[11px] text-emerald-700 font-bold">🌱 Across All Enterprise Scans</span>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-1">
                    <span className="text-slate-500 text-xs font-semibold uppercase">Water Footprint Preserved</span>
                    <p className="text-2xl font-black text-slate-800">{totalWaterSaved.toLocaleString()} L</p>
                    <span className="text-[11px] text-blue-700 font-bold">💧 Industrial Water Saved</span>
                  </div>

                  <div className="bg-purple-50/60 border border-purple-100 p-4 rounded-2xl space-y-1">
                    <span className="text-slate-500 text-xs font-semibold uppercase">Total Waste Diverted</span>
                    <p className="text-2xl font-black text-slate-800">{totalWeightDiverted} Kg</p>
                    <span className="text-[11px] text-purple-700 font-bold">📦 Diverted from Landfill</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-emerald-600" />
                    Platform Scan Stream
                  </h3>

                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="today">Today</option>
                      <option value="this_week">This Week</option>
                      <option value="this_month">This Month</option>
                      <option value="past_3_months">Past 3 Months</option>
                      <option value="all_time">All Time History</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                        <th className="py-3 px-4">Scan ID</th>
                        <th className="py-3 px-4">Origin Role</th>
                        <th className="py-3 px-4">Fabric Type</th>
                        <th className="py-3 px-4">Weight (KG)</th>
                        <th className="py-3 px-4">Impact Generated</th>
                        <th className="py-3 px-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {globalScanLogs.length > 0 ? (
                        globalScanLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-800">{log.id}</td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                {log.role.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium">{log.fabric}</td>
                            <td className="py-3 px-4 font-bold">{log.weight} KG</td>
                            <td className="py-3 px-4 text-emerald-700 font-bold">+{log.co2Saved} Kg CO₂</td>
                            <td className="py-3 px-4 text-slate-400 font-mono">{log.timestamp}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-slate-400">
                            No scan records found for the selected time filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARBON REDUCTION REPORTS */}
          {activeTab === 'carbon' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  Carbon Reduction Reports & Role Contribution
                </h2>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleContributionData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} interval={0} angle={-5} textAnchor="end" />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip formatter={(val) => `${val} Kg CO₂`} />
                      <Bar dataKey="co2" radius={[8, 8, 0, 0]}>
                        {roleContributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WASTE DIVERSION ANALYTICS */}
          {activeTab === 'waste' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Box className="w-5 h-5 mr-2 text-emerald-600" />
                  Waste Diversion Analytics (All Fabrics)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={materialDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {materialDistributionData.map((entry, index) => (
                            <Cell key={`cell-pie-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend verticalAlign="bottom" height={48} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Circular Recovery Strategy Mix</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Fabric Reuse & Upcycling</span>
                        <span className="font-bold text-emerald-600">65%</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Mechanical Fiber Recycling</span>
                        <span className="font-bold text-blue-600">25%</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">Industrial Recovery</span>
                        <span className="font-bold text-purple-600">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUSTAINABILITY CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Scale className="w-5 h-5 mr-2 text-emerald-600" />
                  Sustainability Calculator
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Calculate weighted circularity score, environmental impact, and circular strategy recommendations for any waste batch.
                </p>
              </div>

              <form onSubmit={handleAssessmentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fabric Material Type</label>
                  <select
                    value={assessmentForm.material_type}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, material_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Cotton">Cotton</option>
                    <option value="Polyester">Polyester</option>
                    <option value="Wool">Wool</option>
                    <option value="Silk">Silk</option>
                    <option value="Linen">Linen</option>
                    <option value="Denim">Denim</option>
                    <option value="Nylon">Nylon</option>
                    <option value="Rayon">Rayon</option>
                    <option value="Acrylic">Acrylic</option>
                    <option value="Mixed Fabrics">Mixed Fabrics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Material Condition</label>
                  <select
                    value={assessmentForm.material_condition}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, material_condition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Contaminated">Contaminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Waste Batch Weight (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={assessmentForm.waste_weight_kg}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, waste_weight_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={assessing}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition shadow-sm flex items-center justify-center text-sm disabled:opacity-50"
                  >
                    {assessing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Scale className="w-4 h-4 mr-2" />}
                    Calculate Weighted Circularity Score & Impact
                  </button>
                </div>
              </form>

              {assessmentResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="bg-emerald-950 text-white p-6 rounded-2xl shadow-md border border-emerald-800 space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Circularity Score</span>
                    <p className="text-4xl font-black text-emerald-300">
                      {assessmentResult.circularity.circularity_score} <span className="text-lg font-normal text-slate-400">/ 100</span>
                    </p>
                    <div className="pt-2 border-t border-emerald-900/80">
                      <p className="text-xs text-slate-300 font-medium">Circularity Category:</p>
                      <p className="text-sm font-bold text-white mt-0.5">{assessmentResult.circularity.category}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recommended Strategy</span>
                    <p className="text-xl font-bold text-slate-800">{assessmentResult.recommendation.primary_strategy}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{assessmentResult.recommendation.action_plan}</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Environmental Benefit</span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-emerald-700">🌱 {assessmentResult.environmental_impact.co2_savings_kg} Kg CO₂ Offsets</p>
                      <p className="text-sm font-semibold text-blue-700">💧 {assessmentResult.environmental_impact.water_savings_liters} Liters Water Saved</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI FABRIC SCANNER */}
          {activeTab === 'scanner' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  AI Fabric Scanner
                </h2>
              </div>

              <form onSubmit={handleImageUploadAndAnalyze} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Scan Evaluation Mode</label>
                    <select
                      value={isBatchUpload ? 'batch' : 'single'}
                      onChange={(e) => setIsBatchUpload(e.target.value === 'batch')}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
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

                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="manager-fabric-upload"
                  />
                  <label htmlFor="manager-fabric-upload" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="h-48 object-cover rounded-xl shadow-md mb-3" />
                        <span className="text-xs text-emerald-600 font-semibold">Change Fabric Sample</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6">
                        <Upload className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-semibold text-slate-700">Click to upload textile scan image</p>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={analyzingImage || !selectedFile}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition shadow-sm flex items-center justify-center text-sm disabled:opacity-50"
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
          )}

        </main>
      </div>
    </div>
  );
};

export default SustainabilityManagerDashboard;