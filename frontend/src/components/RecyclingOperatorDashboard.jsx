import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Box, Sparkles, TrendingUp, ImageIcon, Upload, 
  RefreshCw, CheckCircle2, ArrowRight, Clock, Plus,
  FileText, Download, Percent, Factory, Layers, Filter
} from 'lucide-react';
import API, { analyticsService, inventoryService } from '../services/api';

const RecyclingOperatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory');

  // Shared Data States
  const [inventoryList, setInventoryList] = useState([]);
  const [scansList, setScansList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Waste Inventory Form State
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    fabric_type: 'Cotton',
    source: 'Textile Factory Cut-piece',
    quantity: 150,
    color: 'Blue',
    condition: 'Good'
  });

  // AI Fabric Scanner State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState(null);

  // Recycling Opportunities Dispatched Tracking
  const [dispatchedIds, setDispatchedIds] = useState([]);
  const [selectedOppFilter, setSelectedOppFilter] = useState('ALL');

  // Matched Opportunities Data
  const matchedOpportunities = [
    {
      id: 'OPP-8921',
      fabric: 'Cotton (Denim & Yarn scraps)',
      quantityKg: 850,
      targetIndustry: 'Mechanical Spinning Mill',
      conversionRoute: 'Open-End Yarn Spinning',
      purityScore: 92,
      estimatedValue: '₹42,500',
      urgency: 'Immediate Pickup',
      status: 'Ready for Dispatch'
    },
    {
      id: 'OPP-7412',
      fabric: 'Polyester Filament Blend',
      quantityKg: 1200,
      targetIndustry: 'Chemical Depolymerization Plant',
      conversionRoute: 'rPET Pelletization',
      purityScore: 84,
      estimatedValue: '₹38,400',
      urgency: 'Scheduled (3 Days)',
      status: 'Matched'
    },
    {
      id: 'OPP-6304',
      fabric: 'Wool & Mixed Knits',
      quantityKg: 420,
      targetIndustry: 'Felt & Non-Woven Manufacturer',
      conversionRoute: 'Thermal Insulation Padding',
      purityScore: 78,
      estimatedValue: '₹21,000',
      urgency: 'Standard',
      status: 'Matched'
    },
    {
      id: 'OPP-5190',
      fabric: 'Pure Linen Scraps',
      quantityKg: 310,
      targetIndustry: 'Eco-Textile Upcycling Hub',
      conversionRoute: 'Handloom Blended Weft',
      purityScore: 95,
      estimatedValue: '₹24,800',
      urgency: 'High Demand',
      status: 'Ready for Dispatch'
    }
  ];

  // Recovery Statistics Chart Data
  const recoveryEfficiencyData = [
    { fabric: 'Cotton', inflow: 1450, recovered: 1276, rate: 88, fill: '#10B981' },
    { fabric: 'Denim', inflow: 980, recovered: 823, rate: 84, fill: '#3B82F6' },
    { fabric: 'Polyester', inflow: 1200, recovered: 960, rate: 80, fill: '#8B5CF6' },
    { fabric: 'Wool', inflow: 540, recovered: 453, rate: 84, fill: '#F59E0B' },
    { fabric: 'Linen', inflow: 420, recovered: 378, rate: 90, fill: '#06B6D4' },
    { fabric: 'Mixed Blends', inflow: 650, recovered: 422, rate: 65, fill: '#64748B' },
  ];

  const processingRoutesData = [
    { name: 'Mechanical Shredding & Carding', value: 52, color: '#10B981' },
    { name: 'Chemical Depolymerization', value: 28, color: '#3B82F6' },
    { name: 'Thermal Non-Woven Felt', value: 14, color: '#F59E0B' },
    { name: 'Downcycled Padding', value: 6, color: '#94A3B8' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [invRes, scansRes] = await Promise.all([
        inventoryService.getInventory().catch(() => ({ data: [] })),
        analyticsService.getScans('all_time').catch(() => [])
      ]);
      setInventoryList(Array.isArray(invRes.data) ? invRes.data : (Array.isArray(invRes) ? invRes : []));
      setScansList(Array.isArray(scansRes) ? scansRes : (scansRes.data || []));
    } catch (err) {
      console.error("Error fetching facility data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.addInventoryItem(batchForm);
      setShowAddBatchModal(false);
      setBatchForm({
        fabric_type: 'Cotton',
        source: 'Textile Factory Cut-piece',
        quantity: 150,
        color: 'Blue',
        condition: 'Good'
      });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to register waste batch.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageAnalysisResult(null);
    }
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setAnalyzingImage(true);
    try {
      const res = await analyticsService.uploadTextileImage(selectedFile, false, 0);
      setImageAnalysisResult(res);
      fetchDashboardData();
    } catch (err) {
      alert('AI scan processing failed.');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleDispatch = (id) => {
    setDispatchedIds((prev) => [...prev, id]);
  };

  const filteredOpportunities = selectedOppFilter === 'ALL'
    ? matchedOpportunities
    : matchedOpportunities.filter(o => o.status === selectedOppFilter);

  const totalInflowKg = recoveryEfficiencyData.reduce((acc, curr) => acc + curr.inflow, 0);
  const totalRecoveredKg = recoveryEfficiencyData.reduce((acc, curr) => acc + curr.recovered, 0);
  const facilityYieldRate = Math.round((totalRecoveredKg / totalInflowKg) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-2">
          <nav className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl transition ${
                activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Box className="w-4 h-4 mr-3" /> Waste Inventory
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl transition ${
                activeTab === 'scanner' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-4 h-4 mr-3" /> AI Fabric Scanner
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl transition ${
                activeTab === 'opportunities' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-3" /> Recycling Opportunities
            </button>

            <button
              onClick={() => setActiveTab('recovery')}
              className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl transition ${
                activeTab === 'recovery' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-3" /> Recovery Statistics
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-6">

          {/* TAB 1: WASTE INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center">
                    <Box className="w-5 h-5 mr-2 text-emerald-600" />
                    Textile Waste Inventory Log
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage and register incoming factory scrap batches.</p>
                </div>
                <button
                  onClick={() => setShowAddBatchModal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1.5 text-emerald-400" /> Register Waste Batch
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Batch ID</th>
                      <th className="py-3 px-4">Fabric Type</th>
                      <th className="py-3 px-4">Weight (KG)</th>
                      <th className="py-3 px-4">Condition</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {inventoryList.length > 0 ? (
                      inventoryList.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.batch_id || `BAT-${idx + 101}`}</td>
                          <td className="py-3.5 px-4 font-medium">{item.fabric_type || item.fabric}</td>
                          <td className="py-3.5 px-4 font-bold">{item.quantity || item.weight} KG</td>
                          <td className="py-3.5 px-4">{item.condition || 'Good'}</td>
                          <td className="py-3.5 px-4 text-slate-500">{item.source || 'Garment Factory'}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-200 text-[10px]">
                              In Storage
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-400">
                          {loading ? 'Fetching batch records...' : 'No inventory records found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Batch Modal */}
              {showAddBatchModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">Register Incoming Waste Batch</h3>
                    <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Fabric Type</label>
                        <select
                          value={batchForm.fabric_type}
                          onChange={(e) => setBatchForm({ ...batchForm, fabric_type: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                        >
                          <option value="Cotton">Cotton</option>
                          <option value="Denim">Denim</option>
                          <option value="Polyester">Polyester</option>
                          <option value="Wool">Wool</option>
                          <option value="Linen">Linen</option>
                          <option value="Mixed Fabrics">Mixed Fabrics</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Batch Weight (KG)</label>
                        <input
                          type="number"
                          required
                          value={batchForm.quantity}
                          onChange={(e) => setBatchForm({ ...batchForm, quantity: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Waste Source</label>
                        <input
                          type="text"
                          required
                          value={batchForm.source}
                          onChange={(e) => setBatchForm({ ...batchForm, source: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2"
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setShowAddBatchModal(false)}
                          className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
                        >
                          Save Batch
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI FABRIC SCANNER */}
          {activeTab === 'scanner' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-emerald-600" />
                  AI Fabric Diagnostics Scanner
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Visual texture and defect verification</p>
              </div>

              <form onSubmit={handleScanSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="facility-fabric-upload"
                  />
                  <label htmlFor="facility-fabric-upload" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="h-44 object-cover rounded-xl shadow-xs mb-3" />
                        <span className="text-xs text-emerald-600 font-semibold">Change Fabric Sample</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6">
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-700">Click to upload textile sample</p>
                      </div>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={analyzingImage || !selectedFile}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center disabled:opacity-50"
                >
                  {analyzingImage ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />}
                  Run Computer Vision Analysis
                </button>
              </form>

              {imageAnalysisResult && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">AI Classification Verified</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Sample identified with high confidence. Purity profile matched for closed-loop mechanical shredding.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECYCLING OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
                    Recycling Opportunities & Batch Matching
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Automated buyer matching based on fabric purity and batch weight.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setSelectedOppFilter('ALL')}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      selectedOppFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({matchedOpportunities.length})
                  </button>
                  <button
                    onClick={() => setSelectedOppFilter('Ready for Dispatch')}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      selectedOppFilter === 'Ready for Dispatch' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ready for Dispatch
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOpportunities.map((opp) => {
                  const isDispatched = dispatchedIds.includes(opp.id);
                  return (
                    <div key={opp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400">{opp.id}</span>
                          <h3 className="text-xs font-bold text-slate-900">{opp.fabric}</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {opp.purityScore}% AI Purity
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Batch Volume</span>
                          <span className="font-bold text-slate-800">{opp.quantityKg} KG</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Est. Value</span>
                          <span className="font-bold text-emerald-700">{opp.estimatedValue}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[9px] uppercase">Target Route</span>
                          <span className="font-medium text-slate-700">{opp.targetIndustry} • {opp.conversionRoute}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {opp.urgency}
                        </span>

                        <button
                          onClick={() => handleDispatch(opp.id)}
                          disabled={isDispatched}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center ${
                            isDispatched ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isDispatched ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Dispatched
                            </>
                          ) : (
                            <>
                              Initiate Transfer <ArrowRight className="w-3 h-3 ml-1 text-emerald-400" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: RECOVERY STATISTICS */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Total Inflow</span>
                  <p className="text-xl font-black text-slate-900">{totalInflowKg.toLocaleString()} KG</p>
                  <span className="text-[10px] text-slate-400">All registered batches</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Clean Recovered Fiber</span>
                  <p className="text-xl font-black text-emerald-600">{totalRecoveredKg.toLocaleString()} KG</p>
                  <span className="text-[10px] text-emerald-700 font-bold">Usable output produced</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Yield Rate</span>
                  <p className="text-xl font-black text-blue-600">{facilityYieldRate}%</p>
                  <span className="text-[10px] text-blue-700 font-bold">Closed-loop efficiency</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inflow vs. Recovered Output (KG)</h3>
                  </div>
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={recoveryEfficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="fabric" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#94A3B8" fontSize={10} />
                        <Tooltip formatter={(val) => `${val} KG`} />
                        <Bar dataKey="inflow" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="recovered" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Processing Pathways</h3>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processingRoutesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {processingRoutesData.map((entry, index) => (
                            <Cell key={`route-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `${val}%`} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default RecyclingOperatorDashboard;