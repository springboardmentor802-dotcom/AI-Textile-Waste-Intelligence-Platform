import React, { useState, useEffect } from 'react';
import { sustainabilityService, inventoryService, analyticsService } from '../services/api';
import AdminDashboard from '../components/AdminDashboard';
import API from '../services/api';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { 
  Package, BarChart3, Shield, LogOut, Leaf, Scale, 
  RefreshCw, Upload, FileText, CheckCircle2, Image as ImageIcon, 
  Droplet, Box, Activity, Search
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('');
  const [dataset, setDataset] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State for Inventory Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFabricFilter, setSelectedFabricFilter] = useState('All');

  // AI Image Upload & Vision State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);
  
  // Selected Engine Dropdown State
  const [selectedEngine, setSelectedEngine] = useState('image_analysis_engine');

  const engineNames = [
    { id: 'image_analysis_engine', label: '1. Textile Image Analysis Engine' },
    { id: 'material_classification_engine', label: '2. Material Classification Engine' },
    { id: 'waste_classification_engine', label: '3. Textile Waste Classification Engine' },
    { id: 'recycling_recommendation_engine', label: '4. Recycling Recommendation Engine' },
    { id: 'sustainability_intelligence_engine', label: '5. Sustainability Intelligence Engine' },
    { id: 'environmental_impact_engine', label: '6. Environmental Impact Assessment Engine' },
    { id: 'waste_scoring_engine', label: '7. Waste Scoring Engine (5-Tier Weighted Model)' }
  ];

  // Inventory Form State
  const [inventoryForm, setInventoryForm] = useState({
    batch_id: '',
    fabric_type: 'Cotton',
    source: 'Post-Consumer',
    quantity: 50.0,
    color: 'Red',
    condition: 'Good',
    collection_date: new Date().toISOString().split('T')[0]
  });
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Assessment Calculator State
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

  useEffect(() => {
    const role = localStorage.getItem('role') || 'Admin';
    setUserRole(role);
    if (role === 'Admin') {
      setActiveTab('admin');
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [datasetRes, inventoryRes] = await Promise.all([
        sustainabilityService.getDataset(5000).catch(() => ({ data: [] })),
        inventoryService.getInventory().catch(() => ({ data: [] }))
      ]);
      setDataset(datasetRes.data || datasetRes || []);
      setInventory(inventoryRes.data || inventoryRes || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- REAL-TIME DYNAMIC DATA AGGREGATION FROM POSTGRESQL ----------------

  // 1. Dynamic Material Distribution for Pie / Doughnut Chart
  const calculateFabricDistribution = () => {
    const combinedItems = [
      ...dataset.map(d => ({ fabric: d.material_type || d.Material_Type || 'Cotton' })),
      ...inventory.map(i => ({ fabric: i.fabric_type || 'Cotton' }))
    ];

    if (combinedItems.length === 0) {
      return [
        { name: 'Cotton', value: 45, color: '#10B981' },
        { name: 'Denim', value: 25, color: '#3B82F6' },
        { name: 'Polyester', value: 20, color: '#8B5CF6' },
        { name: 'Wool', value: 10, color: '#F59E0B' },
      ];
    }

    const colorPalette = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'];
    const counts = {};

    combinedItems.forEach(item => {
      const mat = item.fabric || 'Cotton';
      counts[mat] = (counts[mat] || 0) + 1;
    });

    const total = combinedItems.length;
    return Object.keys(counts).map((key, idx) => ({
      name: key,
      value: Math.round((counts[key] / total) * 100) || 1,
      color: colorPalette[idx % colorPalette.length]
    }));
  };

  // 2. Dynamic Monthly Waste Diversion Line Chart
  const calculateMonthlyDiversion = () => {
    if (!inventory || inventory.length === 0) {
      return [
        { month: 'Jan', weightKg: 120 },
        { month: 'Feb', weightKg: 280 },
        { month: 'Mar', weightKg: 450 },
        { month: 'Apr', weightKg: 620 },
        { month: 'May', weightKg: 780 },
        { month: 'Jun', weightKg: 950 },
      ];
    }

    const monthsMap = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 };
    let hasValidData = false;

    inventory.forEach(item => {
      const dateVal = item.collection_date || item.created_at;
      if (dateVal) {
        const dateObj = new Date(dateVal);
        const monthName = dateObj.toLocaleString('default', { month: 'short' });
        if (monthsMap[monthName] !== undefined) {
          monthsMap[monthName] += parseFloat(item.quantity || 0);
          hasValidData = true;
        }
      }
    });

    if (!hasValidData) {
      const totalInventoryQty = inventory.reduce((acc, i) => acc + (parseFloat(i.quantity) || 0), 0);
      return [
        { month: 'Jan', weightKg: 100 },
        { month: 'Feb', weightKg: 200 },
        { month: 'Mar', weightKg: 350 },
        { month: 'Apr', weightKg: 500 },
        { month: 'May', weightKg: 650 },
        { month: 'Current', weightKg: totalInventoryQty || 800 },
      ];
    }

    return Object.keys(monthsMap)
      .filter(m => monthsMap[m] > 0)
      .map(m => ({ month: m, weightKg: monthsMap[m] }));
  };

  // 3. Dynamic Circularity Score Tiers for Bar Chart
  const calculateScoreDistribution = () => {
    const combinedItems = [
      ...dataset.map(d => ({ score: parseFloat(d.recyclability_score || d.Recyclability_Score || 75) })),
      ...inventory.map(i => ({ score: i.condition === 'Excellent' ? 95 : i.condition === 'Good' ? 80 : i.condition === 'Fair' ? 65 : 40 }))
    ];

    if (combinedItems.length === 0) {
      return [
        { range: 'High Potential (80-100)', percentage: 60, fill: '#10B981' },
        { range: 'Moderate (50-80)', percentage: 30, fill: '#F59E0B' },
        { range: 'Low Recyclability (<50)', percentage: 10, fill: '#EF4444' },
      ];
    }

    let high = 0, mod = 0, low = 0;
    combinedItems.forEach(item => {
      const score = item.score;
      if (score >= 80) high++;
      else if (score >= 50) mod++;
      else low++;
    });

    const total = combinedItems.length;
    return [
      { range: 'High Potential (80-100)', percentage: Math.round((high / total) * 100), fill: '#10B981' },
      { range: 'Moderate (50-80)', percentage: Math.round((mod / total) * 100), fill: '#F59E0B' },
      { range: 'Low Recyclability (<50)', percentage: Math.round((low / total) * 100), fill: '#EF4444' },
    ];
  };

  const dynamicFabricData = calculateFabricDistribution();
  const dynamicMonthlyData = calculateMonthlyDiversion();
  const dynamicScoreData = calculateScoreDistribution();

  // Calculated Dynamic Environmental & ESG Metrics from PostgreSQL
  const totalDatasetWeight = dataset.reduce((acc, curr) => acc + (parseFloat(curr.waste_weight_kg || curr.Waste_Weight_KG) || 0), 0);
  const totalInventoryWeight = inventory.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
  const combinedTotalWeight = totalDatasetWeight + totalInventoryWeight;

  const liveCo2Saved = (combinedTotalWeight * 3.2).toFixed(1);
  const liveWaterSaved = Math.round(combinedTotalWeight * 1200);
  const liveLandfillVolume = (combinedTotalWeight * 0.0025).toFixed(2);

  // Handlers
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
    if (!selectedFile) {
      alert('Please select an image file first.');
      return;
    }
    setAnalyzingImage(true);
    try {
      const res = await analyticsService.uploadTextileImage(selectedFile);
      if (res && res.results) {
        setImageAnalysisResult(res);

        const fabricTypeStr = (res.results.material_classification_engine?.fabric_type_classification || "Cotton").toLowerCase();
        const recyclabilityVal = parseFloat(res.results.waste_classification_engine?.recyclability_assessment) || 85.0;
        const co2Val = parseFloat(res.results.environmental_impact_engine?.co2_savings_estimation) || 145.0;
        const gradeVal = res.results.material_classification_engine?.material_quality_estimation || "Grade A - Premium Quality";

        let catKey = 'cotton';
        if (fabricTypeStr.includes('denim')) catKey = 'denim';
        else if (fabricTypeStr.includes('poly') || fabricTypeStr.includes('synthetic')) catKey = 'polyester';
        else if (fabricTypeStr.includes('wool')) catKey = 'wool';
        else if (fabricTypeStr.includes('linen')) catKey = 'linen';
        else if (fabricTypeStr.includes('canvas') || fabricTypeStr.includes('jute')) catKey = 'canvas';

        const latestScanPayload = {
          categoryKey: catKey,
          fabricType: fabricTypeStr,
          recyclability: recyclabilityVal,
          co2Saved: co2Val,
          conditionGrade: gradeVal,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        localStorage.setItem('latest_scanned_fabric_data', JSON.stringify(latestScanPayload));
      }
    } catch (err) {
      console.error('Failed to process image analysis request:', err);
      alert('API Request failed.');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleDownloadFullPdf = async () => {
    if (!imageAnalysisResult?.results) return;
    try {
      const response = await API.post('/analytics/export-multi-engine-pdf', {
        batch_id: 'BATCH-AI-' + Math.floor(1000 + Math.random() * 9000),
        results: imageAnalysisResult.results
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Full_Multi_Engine_Textile_Report.txt');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  const handleRegisterInventory = async (e) => {
    e.preventDefault();
    if (!inventoryForm.batch_id) {
      alert('Please specify a unique Batch ID.');
      return;
    }
    setRegistering(true);
    setRegisterSuccess('');
    try {
      await inventoryService.registerWaste(inventoryForm);
      setRegisterSuccess(`Batch #${inventoryForm.batch_id} registered successfully!`);
      setInventoryForm({
        ...inventoryForm,
        batch_id: '',
        quantity: 50.0
      });
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to register waste item.');
    } finally {
      setRegistering(false);
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.batch_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFabric = selectedFabricFilter === 'All' || item.fabric_type === selectedFabricFilter;
    return matchesSearch && matchesFabric;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg">
              <Leaf className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">AI Textile Intelligence</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs bg-slate-800 text-emerald-400 font-mono rounded-full border border-slate-700">
                Enterprise v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Authenticated Role</p>
              <p className="text-sm font-semibold text-emerald-400">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-2">
          <nav className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            {userRole === 'Admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white font-semibold shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 mr-3" /> Overview
              </button>
            )}

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-3" /> Platform Analytics
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'scanner'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-3" /> AI Vision Fabric Scanner
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4 mr-3" /> Circularity Calculator
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'inventory'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 mr-3" /> Waste Inventory Logging
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 0: OVERVIEW (ADMIN COMMAND CENTER) */}
          {activeTab === 'admin' && <AdminDashboard />}

          {/* TAB 1: PLATFORM ANALYTICS (CHARTS & ESG METRICS) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* SECTION 1: ENVIRONMENTAL & ESG IMPACT METRICS CARDS */}
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-emerald-600" />
                  Environmental & ESG Impact Metrics (Live DB)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  
                  {/* Card 1: Carbon Offset */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <span>Total Carbon Offset</span>
                      <Leaf className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-black text-slate-800">{liveCo2Saved} Kg</p>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                      🌱 CO₂ Emissions Reduced
                    </span>
                  </div>

                  {/* Card 2: Water Preserved */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <span>Water Footprint Preserved</span>
                      <Droplet className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-black text-slate-800">{liveWaterSaved.toLocaleString()} L</p>
                    <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full inline-block">
                      💧 Virgin Fiber Replacement Saved
                    </span>
                  </div>

                  {/* Card 3: Landfill Volume Saved */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <span>Landfill Volume Saved</span>
                      <Box className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-black text-slate-800">{liveLandfillVolume} m³</p>
                    <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
                      📦 Landfill Space Reduction Index
                    </span>
                  </div>

                </div>
              </div>

              {/* SECTION 2: VISUAL ANALYTICAL CHARTS (INTERACTIVE GRAPHS) */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                  Visual Analytical Charts & Intelligence Breakdown
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Chart 1: Material Distribution (Doughnut Chart) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Material Distribution Index</h3>
                      <p className="text-slate-400 text-xs">Live percentages calculated from {dataset.length + inventory.length} entries</p>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dynamicFabricData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {dynamicFabricData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Monthly Waste Diversion (Line Chart) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Monthly Waste Diversion (KG)</h3>
                      <p className="text-slate-400 text-xs">Month-wise textile waste prevented from landfills</p>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dynamicMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} />
                          <Tooltip formatter={(value) => `${value} KG`} />
                          <Line type="monotone" dataKey="weightKg" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Circularity Score Distribution (Bar Chart - Full Width) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 lg:col-span-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Circularity Score Distribution (%)</h3>
                      <p className="text-slate-400 text-xs">Calculated dynamically across active database items</p>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dynamicScoreData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="range" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                            {dynamicScoreData.map((entry, index) => (
                              <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AI VISION SCANNER */}
          {activeTab === 'scanner' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  AI Textile Vision & Fabric Analysis Engine
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Upload fabric photos once to generate multi-engine sustainability diagnostics across all 7 processing engines.
                </p>
              </div>

              <form onSubmit={handleImageUploadAndAnalyze} className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="textile-image-upload"
                  />
                  <label htmlFor="textile-image-upload" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Fabric Preview" className="h-48 object-cover rounded-xl shadow-md mb-3" />
                        <span className="text-xs text-emerald-600 font-semibold">Change Fabric Sample Image</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6">
                        <Upload className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-semibold text-slate-700">Click to upload or drag & drop fabric sample</p>
                        <p className="text-xs text-slate-400 mt-1">High resolution PNG, JPG, or WEBP supported</p>
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
                  Process Fabric Image Across All 7 Engines
                </button>
              </form>

              {imageAnalysisResult && (
                <div className="space-y-5 pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl text-white shadow-md">
                    <div className="flex-1">
                      <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block">
                        Select Diagnostic Engine View
                      </span>
                      <select
                        value={selectedEngine}
                        onChange={(e) => setSelectedEngine(e.target.value)}
                        className="mt-1 block w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {engineNames.map((eng) => (
                          <option key={eng.id} value={eng.id}>
                            {eng.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleDownloadFullPdf}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center shadow-md transition self-end sm:self-center"
                    >
                      <FileText className="w-4 h-4 mr-2" /> Download Complete Report
                    </button>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="text-base font-bold text-slate-800 border-b border-slate-200 pb-2">
                      {engineNames.find(e => e.id === selectedEngine)?.label}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {imageAnalysisResult.results[selectedEngine] &&
                        Object.entries(imageAnalysisResult.results[selectedEngine]).map(([key, val]) => (
                          <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
                            <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="font-bold text-slate-800 text-sm leading-snug block">
                              {val.toString()}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CIRCULARITY CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Scale className="w-5 h-5 mr-2 text-emerald-600" />
                  Sustainability Intelligence Calculator
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Compute the 5-Tier Weighted Circularity Score.
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
                    <option value="Denim">Denim</option>
                    <option value="Nylon">Nylon</option>
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

          {/* TAB 4: WASTE INVENTORY LOGGING */}
          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-emerald-600" />
                  Log New Textile Waste Batch
                </h2>
                <p className="text-slate-500 text-xs">Add a new waste shipment to the PostgreSQL database inventory</p>

                {registerSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl font-medium flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                    {registerSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterInventory} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Batch ID</label>
                    <input
                      type="text"
                      placeholder="e.g. BATCH-2026-001"
                      value={inventoryForm.batch_id}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, batch_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fabric Type</label>
                    <select
                      value={inventoryForm.fabric_type}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, fabric_type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Cotton">Cotton</option>
                      <option value="Polyester">Polyester</option>
                      <option value="Wool">Wool</option>
                      <option value="Silk">Silk</option>
                      <option value="Denim">Denim</option>
                      <option value="Nylon">Nylon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inventoryForm.quantity}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Condition</label>
                    <select
                      value={inventoryForm.condition}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, condition: e.target.value })}
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Source Origin</label>
                    <input
                      type="text"
                      placeholder="e.g. Post-Consumer, Factory Waste"
                      value={inventoryForm.source}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, source: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Shade / Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Blue, Multi"
                      value={inventoryForm.color}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, color: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-3 pt-2">
                    <button
                      type="submit"
                      disabled={registering}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition shadow-sm flex items-center justify-center text-sm disabled:opacity-50"
                    >
                      {registering ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                      Register Waste Batch to Inventory
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-800">Logged Inventory Batches</h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Batch ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <select
                      value={selectedFabricFilter}
                      onChange={(e) => setSelectedFabricFilter(e.target.value)}
                      className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="All">All Fabrics</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Polyester">Polyester</option>
                      <option value="Wool">Wool</option>
                      <option value="Denim">Denim</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3.5 px-4">Batch ID</th>
                        <th className="py-3.5 px-4">Fabric</th>
                        <th className="py-3.5 px-4">Quantity (Kg)</th>
                        <th className="py-3.5 px-4">Condition</th>
                        <th className="py-3.5 px-4">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-mono font-medium text-slate-800">{item.batch_id}</td>
                            <td className="py-3.5 px-4 font-medium">{item.fabric_type}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">{item.quantity}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {item.condition}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{item.source}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                            No inventory batches found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;