import React, { useState, useEffect } from 'react';
import { sustainabilityService, inventoryService, analyticsService } from '../services/api';
import AdminDashboard from '../components/AdminDashboard';
import API from '../services/api';
import { 
  LayoutDashboard, Package, BarChart3, Shield, LogOut, Leaf, Scale, 
  RefreshCw, Upload, FileText, CheckCircle2, Image as ImageIcon, 
  Sliders, Activity, Database, AlertCircle, ArrowUpRight, Search, Filter
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

  // 1. AI Image Upload & Vision State
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

  // 2. Inventory Batch Registration Form State
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

  // 3. Sustainability Intelligence Engine Calculator State
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
        sustainabilityService.getDataset(25).catch(() => ({ data: [] })),
        inventoryService.getInventory().catch(() => ({ data: [] }))
      ]);
      setDataset(datasetRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

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
      console.log("Live Backend Dynamic Response:", res);
      if (res && res.results) {
        setImageAnalysisResult(res);
      } else {
        alert('Received empty result from server.');
      }
    } catch (err) {
      console.error('Failed to process image analysis request:', err);
      alert('API Request failed. Please verify that backend server is running.');
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
      alert('Failed to download multi-engine report.');
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

  // Calculated Summary Metrics
  const totalWeightLogged = inventory.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
  const totalBatchesCount = inventory.length;

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
                <Shield className="w-4 h-4 mr-3" /> Admin Command Center
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
              <LayoutDashboard className="w-4 h-4 mr-3" /> Platform Metrics Overview
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

            <button
              onClick={() => setActiveTab('dataset')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                activeTab === 'dataset'
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-3" /> Circularity Dataset
            </button>
          </nav>

          {/* Quick Help Widget */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-2">
            <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">System Status</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              FastAPI ML Pipeline running active image classification, 5-tier circularity scoring engine, and audit log tracking.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 0: ADMIN COMMAND CENTER */}
          {activeTab === 'admin' && <AdminDashboard />}

          {/* TAB 1: OVERVIEW SUMMARY STATS METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Batches</span>
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{totalBatchesCount} Logged</p>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active Storage
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Waste Weight</span>
                    <Scale className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{totalWeightLogged.toFixed(1)} KG</p>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                    Diverted Material
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Avg Circularity Index</span>
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">78.4 / 100</p>
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                    High Potential
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">AI Inference Engine</span>
                    <Sliders className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">Ready</p>
                  <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                    OpenCV + PyTorch
                  </span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Quick Platform Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="p-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition space-y-1"
                  >
                    <p className="font-bold text-slate-800 text-sm flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2 text-emerald-600" /> Scan Fabric Image
                    </p>
                    <p className="text-xs text-slate-500">Run AI Vision defect detection & fiber identification</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="p-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition space-y-1"
                  >
                    <p className="font-bold text-slate-800 text-sm flex items-center">
                      <Scale className="w-4 h-4 mr-2 text-emerald-600" /> Run Circularity Score
                    </p>
                    <p className="text-xs text-slate-500">Calculate 35/20/20/15/10 weighted sustainability score</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="p-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl text-left transition space-y-1"
                  >
                    <p className="font-bold text-slate-800 text-sm flex items-center">
                      <Package className="w-4 h-4 mr-2 text-emerald-600" /> Log Waste Batch
                    </p>
                    <p className="text-xs text-slate-500">Add new textile waste shipment to PostgreSQL database</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI VISION SCANNER & MULTI-ENGINE BREAKDOWN WITH DROPDOWN SELECTOR */}
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

              {/* AI Multi-Engine Analysis Results with Interactive Dropdown Selection */}
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
                      <FileText className="w-4 h-4 mr-2" /> Download Complete Multi-Engine Report
                    </button>
                  </div>

                  {/* Dynamic Engine-Specific Metrics Display Panel */}
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

          {/* TAB 3: 5-TIER WEIGHTED CIRCULARITY CALCULATOR MODULE */}
          {activeTab === 'calculator' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Scale className="w-5 h-5 mr-2 text-emerald-600" />
                  Sustainability Intelligence Calculator
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Compute the 5-Tier Weighted Circularity Score (35% Recyclability, 20% Condition, 20% Reuse, 15% Env. Benefit, 10% Feasibility).
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

          {/* TAB 4: WASTE INVENTORY LOGGING FORM & TABLE */}
          {activeTab === 'inventory' && (
            <div className="space-y-8">
              {/* Form: Register New Waste Batch */}
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

              {/* Table with Search & Filter: Logged Waste Batches */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-800">Logged Inventory Batches</h2>
                  
                  {/* Search and Filter Inputs */}
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

          {/* TAB 5: CIRCULARITY DATASET EXPLORER */}
          {activeTab === 'dataset' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-emerald-600" />
                    Sustainable Fashion Dataset Inspection
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">Explore enterprise textile sustainability records</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3.5 px-4">Material Type</th>
                      <th className="py-3.5 px-4">Material Condition</th>
                      <th className="py-3.5 px-4">Weight (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {dataset.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-medium text-slate-800">{row.Material_Type || 'Cotton'}</td>
                        <td className="py-3.5 px-4">{row.Material_Condition || 'Good'}</td>
                        <td className="py-3.5 px-4 font-mono">{row.Waste_Weight_KG || 50.0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;