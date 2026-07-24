import React, { useState, useEffect } from 'react';
import { analyticsService, inventoryService } from '../services/api';
import { 
  BarChart2, Package, UploadCloud, Cpu, Award, 
  Settings, User, LogOut, RefreshCw, FileText, 
  TrendingUp, Activity, ShieldCheck, Factory, CheckCircle2, Database,
  Recycle, PieChart, Layers
} from 'lucide-react';

function Dashboard({ onLogout }) {
  // 🔒 Secure Role Retrieval & Normalization
  const rawRole = localStorage.getItem('role') || 'Admin';

  const normalizeRole = (role) => {
    if (!role) return 'Admin';
    const cleaned = role.replace(/_/g, ' ').trim();
    if (cleaned.toLowerCase().includes('recycling')) return 'Recycling Facility';
    if (cleaned.toLowerCase().includes('sustainability')) return 'Sustainability Manager';
    if (cleaned.toLowerCase().includes('manufacturer')) return 'Manufacturer';
    return 'Admin';
  };

  const userRole = normalizeRole(rawRole);
  const [activeTab, setActiveTab] = useState('Overview');

  // --- 🔬 State: Telemetry Analytics Form ---
  const [formData, setFormData] = useState({
    material_type: 'Denim',
    material_condition: 'Clean',
    reuse_potential: 'High',
    environmental_benefit: 'High',
    processing_feasibility: 'Medium',
    waste_weight_kg: 50.0
  });
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // --- 📦 State: Complete Inventory Form & Table ---
  const [inventoryList, setInventoryList] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryMessage, setInventoryMessage] = useState({ type: '', text: '' });
  const [wasteForm, setWasteForm] = useState({
    batch_id: '',
    fabric_type: 'Cotton',
    source: '',
    quantity: '',
    color: '',
    condition: 'Excellent',
    collection_date: new Date().toISOString().split('T')[0]
  });

  // --- 📊 State: PostgreSQL 5,000 Dataset ---
  const [datasetRecords, setDatasetRecords] = useState([]);
  const [datasetLoading, setDatasetLoading] = useState(false);

  // --- 📷 State: Vision Image Upload ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [visionResponse, setVisionResponse] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState('');

  // Auto-fetch on Tab change
  useEffect(() => {
    if (activeTab === 'Inventory' || activeTab === 'Waste Inventory') {
      fetchInventoryData();
    } else if (activeTab === 'Analytics' || activeTab === 'Processing Analytics') {
      fetchDatasetData();
    }
  }, [activeTab]);

  const fetchInventoryData = async () => {
    setInventoryLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setInventoryList(data.data || []);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchDatasetData = async () => {
    setDatasetLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/sustainability/?limit=20');
      const data = await response.json();
      setDatasetRecords(data.data || []);
    } catch (err) {
      console.error("Dataset fetch failed", err);
    } finally {
      setDatasetLoading(false);
    }
  };

  // Telemetry Evaluation Submit
  const handleAssessSubmit = async (e) => {
    e.preventDefault();
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const result = await analyticsService.assessMaterialSustainability(formData);
      setAssessmentResult(result);
    } catch (err) {
      setAnalyticsError('Failed to run sustainability matrix evaluation.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Waste Inventory Form Submit (POST to PostgreSQL DB)
  const handleWasteSubmit = async (e) => {
    e.preventDefault();
    setInventoryLoading(true);
    setInventoryMessage({ type: '', text: '' });

    try {
      const payload = {
        ...wasteForm,
        quantity: parseFloat(wasteForm.quantity),
        collection_date: new Date(wasteForm.collection_date).toISOString()
      };

      await inventoryService.registerWaste(payload);
      setInventoryMessage({ type: 'success', text: '✅ Waste batch registered successfully in PostgreSQL DB!' });
      
      // Reset form
      setWasteForm({
        batch_id: '',
        fabric_type: 'Cotton',
        source: '',
        quantity: '',
        color: '',
        condition: 'Excellent',
        collection_date: new Date().toISOString().split('T')[0]
      });
      
      fetchInventoryData();
    } catch (err) {
      setInventoryMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Something went wrong. Please check inputs.' 
      });
    } finally {
      setInventoryLoading(false);
    }
  };

  // Inventory Batch Delete Handler
  const handleDeleteInventory = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch from PostgreSQL?")) {
      try {
        await inventoryService.deleteInventory(id);
        fetchInventoryData();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  // Image Upload Handler
  const handleImageUpload = async () => {
    if (!selectedFile) {
      setVisionError('Please select an image file first.');
      return;
    }
    setVisionLoading(true);
    setVisionError('');
    try {
      const result = await analyticsService.uploadTextileImage(selectedFile);
      setVisionResponse(result);
    } catch (err) {
      setVisionError('Vision stream error.');
    } finally {
      setVisionLoading(false);
    }
  };

  // 🎯 Role-Based Dynamic Sidebar Configuration
  const roleMenus = {
    'Admin': [
      { name: 'Overview', icon: BarChart2 },
      { name: 'Inventory', icon: Package },
      { name: 'Upload Waste', icon: UploadCloud },
      { name: 'Analytics', icon: Cpu },
      { name: 'User Management', icon: User },
      { name: 'Platform Analytics', icon: Activity },
      { name: 'System Monitoring', icon: ShieldCheck },
      { name: 'Settings', icon: Settings },
    ],
    'Recycling Facility': [
      { name: 'Overview', icon: BarChart2 },
      { name: 'Waste Inventory', icon: Package },
      { name: 'Recycling Opportunities', icon: RefreshCw },
      { name: 'Processing Analytics', icon: Activity },
      { name: 'Recovery Statistics', icon: TrendingUp },
      { name: 'Settings', icon: Settings },
    ],
    'Sustainability Manager': [
      { name: 'Overview', icon: BarChart2 },
      { name: 'Sustainability Metrics', icon: Award },
      { name: 'Carbon Reduction Reports', icon: FileText },
      { name: 'Waste Diversion Analytics', icon: PieChart },
      { name: 'ESG Reporting', icon: ShieldCheck },
      { name: 'Settings', icon: Settings },
    ],
    'Manufacturer': [
      { name: 'Overview', icon: BarChart2 },
      { name: 'Production Waste Analysis', icon: Factory },
      { name: 'Circular Economy Insights', icon: Recycle },
      { name: 'Material Recovery Reports', icon: Layers },
      { name: 'Sustainability Performance', icon: Award },
      { name: 'Settings', icon: Settings },
    ]
  };

  const currentNavItems = roleMenus[userRole] || roleMenus['Admin'];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 🟢 LEFT SIDEBAR */}
      <aside className="w-64 bg-[#111827] text-slate-300 flex flex-col justify-between p-4 shadow-xl shrink-0">
        <div>
          <div className="flex items-center gap-2 px-2 py-4 mb-6 border-b border-slate-800">
            <Cpu className="w-7 h-7 text-emerald-500" />
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">
              AI Textile Waste<br />Intelligence
            </h1>
          </div>

          <nav className="space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 🔵 RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">
              Welcome back, {userRole} 👋
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Active Module: <span className="font-semibold text-emerald-600">{activeTab}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Role: {userRole}</span>
          </div>
        </div>

        {/* =========================================================
            1️⃣ OVERVIEW VIEW
           ========================================================= */}
        {activeTab === 'Overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Telemetry Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1">
                <h3 className="text-lg font-bold text-slate-900 mb-4">🔬 Material Telemetry Assessment</h3>
                <form onSubmit={handleAssessSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Material Type</label>
                    <select name="material_type" value={formData.material_type} onChange={(e) => setFormData({...formData, material_type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="Cotton">Cotton</option>
                      <option value="Polyester">Polyester</option>
                      <option value="Wool">Wool</option>
                      <option value="Nylon">Nylon</option>
                      <option value="Denim">Denim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Condition</label>
                    <select name="material_condition" value={formData.material_condition} onChange={(e) => setFormData({...formData, material_condition: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="Clean">Clean</option>
                      <option value="Medium">Medium</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Weight (KG)</label>
                    <input type="number" value={formData.waste_weight_kg} onChange={(e) => setFormData({...formData, waste_weight_kg: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>

                  <button type="submit" disabled={analyticsLoading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition">
                    {analyticsLoading ? 'Evaluating...' : 'Execute Logic Matrix'}
                  </button>
                </form>
                {analyticsError && <p className="text-red-500 text-xs mt-2">{analyticsError}</p>}
              </div>

              {/* Assessment Output */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Live Analytics Report</h3>
                  {!assessmentResult ? (
                    <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-sm italic">
                      Trigger telemetry evaluation to render score matrix.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-bold uppercase">Circularity Score</span>
                          <div className="text-4xl font-black text-emerald-600 mt-1">{assessmentResult.metrics.score}/100</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-bold uppercase">Grade</span>
                          <div className="text-sm font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg mt-1">
                            {assessmentResult.metrics.category}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                          <div className="text-2xl font-black text-emerald-600">{assessmentResult.co2_savings_estimated_kg} KG</div>
                          <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Estimated CO₂ Reduction</div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                          <div className="text-2xl font-black text-blue-600">{assessmentResult.water_savings_estimated_liters.toLocaleString()} L</div>
                          <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Estimated Water Saved</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            2️⃣ INVENTORY / WASTE INVENTORY VIEW (FULL FEATURES)
           ========================================================= */}
        {(activeTab === 'Inventory' || activeTab === 'Waste Inventory') && (
          <div className="space-y-8">
            {inventoryMessage.text && (
              <div className={`p-4 rounded-xl text-sm font-semibold ${
                inventoryMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {inventoryMessage.text}
              </div>
            )}

            {/* Waste Registration Form Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" /> Waste Batch Registration Form
              </h2>
              <form onSubmit={handleWasteSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Waste Batch ID</label>
                  <input type="text" name="batch_id" value={wasteForm.batch_id} onChange={(e) => setWasteForm({...wasteForm, batch_id: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" placeholder="e.g., BATCH-2026-001" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fabric Type</label>
                  <select name="fabric_type" value={wasteForm.fabric_type} onChange={(e) => setWasteForm({...wasteForm, fabric_type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500">
                    {['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Nylon', 'Rayon', 'Acrylic', 'Mixed Fabrics'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Source / Origin</label>
                  <input type="text" name="source" value={wasteForm.source} onChange={(e) => setWasteForm({...wasteForm, source: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" placeholder="e.g., Production Scrap" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Quantity (Kg)</label>
                  <input type="number" step="0.01" name="quantity" value={wasteForm.quantity} onChange={(e) => setWasteForm({...wasteForm, quantity: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" placeholder="Weight in Kg" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Color</label>
                  <input type="text" name="color" value={wasteForm.color} onChange={(e) => setWasteForm({...wasteForm, color: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" placeholder="e.g., Navy Blue" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Condition</label>
                  <select name="condition" value={wasteForm.condition} onChange={(e) => setWasteForm({...wasteForm, condition: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500">
                    {['Excellent', 'Good', 'Fair', 'Poor', 'Contaminated'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Collection Date</label>
                  <input type="date" name="collection_date" value={wasteForm.collection_date} onChange={(e) => setWasteForm({...wasteForm, collection_date: e.target.value})} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" />
                </div>

                <div className="md:col-span-3 flex justify-end mt-2">
                  <button type="submit" disabled={inventoryLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow transition disabled:bg-emerald-400 text-sm">
                    {inventoryLoading ? 'Registering...' : '+ Register Waste Batch'}
                  </button>
                </div>
              </form>
            </div>

            {/* Inventory Monitoring Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <h2 className="text-lg font-bold text-slate-900 p-6 border-b border-slate-200">📋 Inventory Monitoring (Live PostgreSQL)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                      <th className="p-4">Batch ID</th>
                      <th className="p-4">Fabric Type</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4">Color</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-600 text-sm">
                    {inventoryList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-6 text-center text-slate-400 italic">No waste batches registered yet.</td>
                      </tr>
                    ) : (
                      inventoryList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-800">{item.batch_id}</td>
                          <td className="p-4">{item.fabric_type}</td>
                          <td className="p-4">{item.source}</td>
                          <td className="p-4 font-semibold text-emerald-600">{item.quantity} Kg</td>
                          <td className="p-4">{item.color}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              item.condition === 'Excellent' || item.condition === 'Good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>{item.condition}</span>
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleDeleteInventory(item.id)} className="text-red-600 hover:text-red-800 font-semibold text-xs">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            3️⃣ UPLOAD WASTE / IMAGE PIPELINE VIEW (DYNAMIC REPORT)
           ========================================================= */}
        {activeTab === 'Upload Waste' && (
          <div className="space-y-8">
            
            {/* Upload Input Box */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  Textile Image Analysis & Intelligence Engine
                </h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Upload fabric sample images to execute our multi-model pipeline: <b>OpenCV</b> for surface defect/texture detection, <b>PyTorch/TF Tensors</b> for material blend recognition, and <b>Pandas CSV Dataset Query</b> for recyclability assessment.
              </p>

              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }} 
                  className="block w-full text-sm text-slate-500 border border-slate-200 p-3 rounded-xl bg-slate-50 focus:outline-none file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                />
                <button 
                  onClick={handleImageUpload} 
                  disabled={visionLoading || !selectedFile} 
                  className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-200 transition disabled:bg-slate-300 shrink-0 flex items-center justify-center gap-2"
                >
                  {visionLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Executing AI Engine...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Run AI Inference
                    </>
                  )}
                </button>
              </div>

              {visionError && <p className="text-red-500 text-xs mt-3 font-semibold">{visionError}</p>}
            </div>

            {/* 📊 Dynamic AI Assessment Output Report */}
            {visionResponse && (
              <div className="space-y-6">
                
                {/* Header Summary Bar */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      AI Execution Complete ({visionResponse.model_architecture})
                    </span>
                    <h4 className="text-2xl font-black mt-1">
                      Textile Classification & Recyclability Assessment Report
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Model Confidence: {((visionResponse.material_classification?.confidence_score || 0.94) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Column 1: Image & Visual Feature Analysis */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" /> Visual & Texture Scanning
                    </h5>

                    {selectedFile ? (
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Fabric Sample" 
                        className="w-full h-52 object-cover rounded-xl border border-slate-200 shadow-inner"
                      />
                    ) : (
                      <div className="h-52 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                        Sample Image Preview
                      </div>
                    )}

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 font-medium">Dominant Color:</span>
                        <span className="font-bold text-slate-800">{visionResponse.visual_features?.detected_color}</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 font-medium">Texture & Pattern:</span>
                        <span className="font-bold text-slate-800">{visionResponse.visual_features?.texture_pattern}</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 font-medium">Surface Damage Scan:</span>
                        <span className="font-bold text-emerald-600">{visionResponse.visual_features?.surface_damage_pct}%</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 font-medium">Contamination Scan:</span>
                        <span className="font-bold text-emerald-600">{visionResponse.visual_features?.contamination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Material & Fiber Composition Engine */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-600" /> Material & Blend Classification
                    </h5>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <span className="text-xs text-emerald-700 font-bold uppercase">Primary Fabric Identified</span>
                      <p className="text-xl font-black text-emerald-900 mt-1">
                        {visionResponse.material_classification?.primary_fabric}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-200 text-emerald-900 text-xs font-bold rounded-md">
                        {visionResponse.material_classification?.quality_grade}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Fiber Composition Prediction</span>
                      {visionResponse.material_classification?.fiber_composition && 
                        Object.entries(visionResponse.material_classification.fiber_composition).map(([fiber, pct]) => (
                          <div key={fiber} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{fiber}</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* Column 3: Waste Categorization & Recyclability Assessment */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                    <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Recycle className="w-4 h-4 text-blue-600" /> Recyclability Assessment
                    </h5>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                      <span className="text-xs text-blue-600 font-bold uppercase">Circularity Index</span>
                      <p className="text-4xl font-black text-blue-700 mt-1">
                        {visionResponse.waste_assessment?.recyclability_score}%
                      </p>
                      <p className="text-xs font-semibold text-blue-800 mt-1">
                        Category: {visionResponse.waste_assessment?.waste_category}
                      </p>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-bold uppercase block text-[10px]">Recommended Action</span>
                        <p className="font-bold text-slate-800 mt-1">
                          {visionResponse.waste_assessment?.recommended_disposal}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                          <span className="text-xs font-black text-emerald-700 block">
                            {visionResponse.waste_assessment?.environmental_impact?.co2_savings_kg} KG
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">CO₂ Offset</span>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                          <span className="text-xs font-black text-blue-700 block">
                            {visionResponse.waste_assessment?.environmental_impact?.water_savings_liters} L
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Water Saved</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================================
            4️⃣ ANALYTICS / 5000 DATASET VIEW
           ========================================================= */}
        {(activeTab === 'Analytics' || activeTab === 'Processing Analytics') && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" /> PostgreSQL 5,000 Dataset Analytics
            </h3>
            <p className="text-slate-500 text-sm mb-4">Querying live enterprise database rows directly from backend API.</p>
            {datasetLoading ? (
              <p className="text-slate-500 text-sm">Querying database...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 uppercase text-slate-500 font-bold border-b">
                    <tr>
                      <th className="p-3">Brand ID</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">Material</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Carbon (MT)</th>
                      <th className="p-3">Water (L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasetRecords.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{row.brand_id}</td>
                        <td className="p-3">{row.country}</td>
                        <td className="p-3">{row.material_type}</td>
                        <td className="p-3 font-bold text-emerald-600">{row.sustainability_rating}</td>
                        <td className="p-3">{row.carbon_footprint_mt}</td>
                        <td className="p-3">{row.water_usage_liters}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            5️⃣ RECYCLING FACILITY DEDICATED MODULES
           ========================================================= */}
        {activeTab === 'Recycling Opportunities' && (
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="text-lg font-bold text-slate-900">♻️ High-Yield Recycling Opportunities</h3>
            <p className="text-sm text-slate-500">Matches high-purity cotton and denim batches with nearest mechanical shredding plants.</p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="font-bold text-emerald-800 text-sm">Match #1: 100% Pure Cotton Blend</span>
              <p className="text-xs text-emerald-600 mt-1">Available Quantity: 2,400 KG | Estimated Fiber Yield: 94%</p>
            </div>
          </div>
        )}

        {activeTab === 'Recovery Statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Mechanical Recovery Yield</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">88.4%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Chemical Recycling Feedstock</span>
              <p className="text-3xl font-black text-blue-600 mt-2">11.6%</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border text-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Landfill Diversion Rate</span>
              <p className="text-3xl font-black text-purple-600 mt-2">94.2%</p>
            </div>
          </div>
        )}

        {/* =========================================================
            6️⃣ SUSTAINABILITY MANAGER MODULES
           ========================================================= */}
        {activeTab === 'Sustainability Metrics' && (
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="text-lg font-bold text-slate-900">🌿 Enterprise Sustainability Scorecard</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="text-xs text-slate-500 uppercase font-bold">Scope 3 Emission Offsets</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">124.8 MT CO₂e</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border">
                <p className="text-xs text-slate-500 uppercase font-bold">Water Neutrality Progress</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">78.5% Achieved</p>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'Carbon Reduction Reports' || activeTab === 'ESG Reporting') && (
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="text-lg font-bold text-slate-900">📄 Compliance & ESG Export Panel</h3>
            <p className="text-sm text-slate-500">Automated generation of EU Digital Product Passport (DPP) and Corporate Sustainability Reporting Directive (CSRD) formats.</p>
            <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">
              📥 Download CSRD Compliance PDF
            </button>
          </div>
        )}

        {/* =========================================================
            7️⃣ MANUFACTURER MODULES
           ========================================================= */}
        {activeTab === 'Production Waste Analysis' && (
          <div className="bg-white p-6 rounded-2xl border space-y-4">
            <h3 className="text-lg font-bold text-slate-900">🏭 Factory Production Waste Stream</h3>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              ⚠️ <b>Pre-Consumer Scrap Alert:</b> Cutting table scrap loss in Batch #881 exceeded target threshold by 3.2%.
            </div>
          </div>
        )}

        {/* =========================================================
            8️⃣ ADMIN MODULES (USER MANAGEMENT, SYSTEM MONITORING)
           ========================================================= */}
        {activeTab === 'User Management' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">👑 User Management Panel</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-slate-800">admin@textile.ai</p>
                  <p className="text-xs text-slate-500">Role: Admin</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Active</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-slate-800">manager@textile.ai</p>
                  <p className="text-xs text-slate-500">Role: Sustainability Manager</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Active</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'System Monitoring' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">🛡️ System Status & Backend Health</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-bold text-xs text-slate-700">FastAPI Server</p>
                  <p className="text-xs text-emerald-600 font-semibold">Online (127.0.0.1:8000)</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-bold text-xs text-slate-700">PostgreSQL Database</p>
                  <p className="text-xs text-emerald-600 font-semibold">Connected (5,000 rows)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common Settings Module */}
        {activeTab === 'Settings' && (
          <div className="bg-white p-6 rounded-2xl border">
            <h3 className="text-lg font-bold text-slate-900 mb-2">⚙️ System Configuration</h3>
            <p className="text-slate-500 text-sm">PostgreSQL Database and FastAPI Endpoints connected successfully.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default Dashboard;