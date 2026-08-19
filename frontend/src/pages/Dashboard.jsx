import React, { useState, useEffect } from 'react';
import { inventoryService, adminService, analyticsService } from '../services/api';
import AdminDashboard from '../components/AdminDashboard';
import SustainabilityManagerDashboard from '../components/SustainabilityManagerDashboard';
import ManufacturerDashboard from '../components/ManufacturerDashboard';
import FabricScannerComponent from '../components/FabricScannerComponent';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { 
  Package, BarChart3, Shield, LogOut, Leaf, 
  RefreshCw, CheckCircle2, Image as ImageIcon, 
  Droplet, Box, Search, Users, Factory, FileSpreadsheet,
  Sparkles, TrendingUp, ArrowRight, Clock, Percent, FileText
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('');
  const [inventory, setInventory] = useState([]);
  const [scansList, setScansList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State for Inventory Table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFabricFilter, setSelectedFabricFilter] = useState('All');

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

  // Recycling Opportunities States
  const [selectedOppFilter, setSelectedOppFilter] = useState('ALL');
  const [dispatchedIds, setDispatchedIds] = useState([]);
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

  // Recovery Statistics Data
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

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, scansRes] = await Promise.all([
        inventoryService.getInventory().catch(() => ({ data: [] })),
        analyticsService.getScans('all_time').catch(() => [])
      ]);
      setInventory(inventoryRes.data || inventoryRes || []);
      setScansList(Array.isArray(scansRes) ? scansRes : (scansRes.data || []));
    } catch (err) {
      console.error('Error loading dashboard dynamic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role') || 'ADMIN';
    setUserRole(role);
    if (role === 'ADMIN' || role === 'Admin') {
      setActiveTab('admin');
    }
    fetchInitialData();

    const handleScanCompleted = () => {
      fetchInitialData();
    };

    window.addEventListener('textile_scan_completed', handleScanCompleted);
    return () => window.removeEventListener('textile_scan_completed', handleScanCompleted);
  }, []);

  const normalizeFabricName = (rawName) => {
    const s = (rawName || '').toLowerCase();
    if (s.includes('denim')) return 'Denim';
    if (s.includes('cotton') || s.includes('canvas')) return 'Cotton';
    if (s.includes('poly') || s.includes('mesh') || s.includes('synthetic') || s.includes('filament')) return 'Polyester';
    if (s.includes('wool') || s.includes('fleece') || s.includes('sherpa') || s.includes('plush') || s.includes('knit')) return 'Wool';
    if (s.includes('linen') || s.includes('flax')) return 'Linen';
    if (s.includes('silk')) return 'Silk';
    if (s.includes('nylon')) return 'Nylon';
    if (s.includes('leather')) return 'Vegan Leather';
    return 'Mixed Fabrics';
  };

  // 1. DYNAMIC MATERIAL DISTRIBUTION
  const calculateFabricDistribution = () => {
    const counts = {};
    const categoryColors = {
      'Cotton': '#10B981',
      'Denim': '#3B82F6',
      'Polyester': '#8B5CF6',
      'Wool': '#F59E0B',
      'Linen': '#06B6D4',
      'Silk': '#EC4899',
      'Nylon': '#6366F1',
      'Vegan Leather': '#14B8A6',
      'Mixed Fabrics': '#64748B'
    };

    inventory.forEach(item => {
      const fab = normalizeFabricName(item.fabric_type);
      counts[fab] = (counts[fab] || 0) + (parseFloat(item.quantity) || 1);
    });

    scansList.forEach(scan => {
      const fab = normalizeFabricName(scan.fabric);
      counts[fab] = (counts[fab] || 0) + (parseFloat(scan.weight) || 1);
    });

    const totalWeight = Object.values(counts).reduce((a, b) => a + b, 0);

    if (totalWeight === 0) {
      return [
        { name: 'Cotton', value: 50, color: '#10B981' },
        { name: 'Denim', value: 30, color: '#3B82F6' },
        { name: 'Polyester', value: 20, color: '#8B5CF6' }
      ];
    }

    return Object.keys(counts).map((key) => ({
      name: key,
      value: Math.round((counts[key] / totalWeight) * 100) || 1,
      color: categoryColors[key] || '#64748B'
    }));
  };

  // 2. DYNAMIC MONTHLY WASTE DIVERSION
  const calculateMonthlyDiversion = () => {
    const monthsMap = {};
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentMonthStr = new Date().toLocaleString('default', { month: 'short' });
    monthsMap[currentMonthStr] = 0;

    inventory.forEach(item => {
      const dateVal = item.collection_date || item.created_at;
      if (dateVal) {
        const m = new Date(dateVal).toLocaleString('default', { month: 'short' });
        monthsMap[m] = (monthsMap[m] || 0) + (parseFloat(item.quantity) || 0);
      }
    });

    scansList.forEach(scan => {
      const dateVal = scan.timestamp;
      if (dateVal) {
        const m = new Date(dateVal).toLocaleString('default', { month: 'short' });
        monthsMap[m] = (monthsMap[m] || 0) + (parseFloat(scan.weight) || 0);
      }
    });

    const result = Object.keys(monthsMap)
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
      .map(m => ({
        month: m,
        weightKg: Math.round(monthsMap[m])
      }));

    return result.length > 0 ? result : [{ month: currentMonthStr, weightKg: 100 }];
  };

  // 3. DYNAMIC CIRCULARITY SCORE DISTRIBUTION
  const calculateScoreDistribution = () => {
    let high = 0, mod = 0, low = 0;

    inventory.forEach(item => {
      const c = (item.condition || '').toLowerCase();
      if (c.includes('excellent') || c.includes('good')) high++;
      else if (c.includes('fair')) mod++;
      else low++;
    });

    scansList.forEach(scan => {
      const c = (scan.fabric || '').toLowerCase();
      if (c.includes('cotton') || c.includes('denim') || c.includes('linen')) high++;
      else if (c.includes('poly') || c.includes('wool')) mod++;
      else low++;
    });

    const total = high + mod + low;
    if (total === 0) {
      return [
        { range: 'High Potential (80-100)', percentage: 65, fill: '#10B981' },
        { range: 'Moderate (50-80)', percentage: 25, fill: '#F59E0B' },
        { range: 'Low Recyclability (<50)', percentage: 10, fill: '#EF4444' },
      ];
    }

    return [
      { range: 'High Potential (80-100)', percentage: Math.round((high / total) * 100), fill: '#10B981' },
      { range: 'Moderate (50-80)', percentage: Math.round((mod / total) * 100), fill: '#F59E0B' },
      { range: 'Low Recyclability (<50)', percentage: Math.round((low / total) * 100), fill: '#EF4444' },
    ];
  };

  const dynamicFabricData = calculateFabricDistribution();
  const dynamicMonthlyData = calculateMonthlyDiversion();
  const dynamicScoreData = calculateScoreDistribution();

  // Cumulative Live Metrics
  const totalInvWeight = inventory.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);
  const totalScanWeight = scansList.reduce((acc, curr) => acc + (parseFloat(curr.weight) || 0), 0);
  const totalActiveWeight = totalInvWeight + totalScanWeight;

  const totalScansCo2 = scansList.reduce((acc, curr) => acc + (parseFloat(curr.co2Saved) || 0), 0);
  const totalInvCo2 = totalInvWeight * 3.2;
  const liveCo2Saved = (totalScansCo2 + totalInvCo2).toFixed(1);

  const totalScansWater = scansList.reduce((acc, curr) => acc + (parseFloat(curr.waterSaved) || 0), 0);
  const totalInvWater = totalInvWeight * 1200;
  const liveWaterSaved = Math.round(totalScansWater + totalInvWater);

  const liveLandfillVolume = (totalActiveWeight * 0.0025).toFixed(2);

  // Recovery Aggregates
  const totalInflowKg = recoveryEfficiencyData.reduce((acc, curr) => acc + curr.inflow, 0);
  const totalRecoveredKg = recoveryEfficiencyData.reduce((acc, curr) => acc + curr.recovered, 0);
  const facilityYieldRate = Math.round((totalRecoveredKg / totalInflowKg) * 100);

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

  const handleDispatch = (id) => {
    setDispatchedIds((prev) => [...prev, id]);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const filteredOpportunities = selectedOppFilter === 'ALL'
    ? matchedOpportunities
    : matchedOpportunities.filter(o => o.status === selectedOppFilter);

  const roleUpper = (userRole || '').toUpperCase();
  const isAdmin = roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR';
  const isSustainabilityManager = roleUpper.includes('SUSTAINABILITY');
  const isManufacturer = roleUpper.includes('MANUFACTURER');

  if (isSustainabilityManager) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-lg">
                <Leaf className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-bold text-lg tracking-tight">AI Textile Intelligence</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">Authenticated Role</p>
                <p className="text-sm font-semibold text-emerald-400">Sustainability Manager</p>
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

        <SustainabilityManagerDashboard />
      </div>
    );
  }

  if (isManufacturer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-lg">
                <Factory className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-bold text-lg tracking-tight">AI Textile Intelligence</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">Authenticated Role</p>
                <p className="text-sm font-semibold text-emerald-400">Textile Manufacturer</p>
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

        <ManufacturerDashboard />
      </div>
    );
  }

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
            <span className="font-bold text-lg tracking-tight">AI Textile Intelligence</span>
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
            {isAdmin ? (
              <>
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

                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                    activeTab === 'users'
                      ? 'bg-emerald-600 text-white font-semibold shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-3" /> User Management
                </button>

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
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                    activeTab === 'reports'
                      ? 'bg-emerald-600 text-white font-semibold shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-3" /> Report Management
                </button>

                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                    activeTab === 'scanner'
                      ? 'bg-emerald-600 text-white font-semibold shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 mr-3" /> AI Fabric Scanner
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
              </>
            ) : (
              <>
                {/* Platform Analytics Tab for Recycling Operator */}
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

                {/* AI Fabric Scanner */}
                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                    activeTab === 'scanner'
                      ? 'bg-emerald-600 text-white font-semibold shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 mr-3" /> AI Fabric Scanner
                </button>

                {/* Waste Inventory Logging */}
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

                {/* Recycling Opportunities */}
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                    activeTab === 'opportunities'
                      ? 'bg-emerald-600 text-white font-semibold shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mr-3" /> Recycling Opportunities
                </button>

                {/* Recovery Statistics */}
                <button
                  onClick={() => setActiveTab('recovery')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                    activeTab === 'recovery'
                      ? 'bg-emerald-600 text-white font-semibold shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-3" /> Recovery Statistics
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 0: ADMIN OVERVIEW */}
          {activeTab === 'admin' && <AdminDashboard viewMode="overview" />}

          {/* TAB 0.5: ADMIN USER MANAGEMENT */}
          {activeTab === 'users' && <AdminDashboard viewMode="users" />}

          {/* TAB 0.8: ADMIN REPORT MANAGEMENT */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                      Platform Report Management & Audit Exports
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Generate, audit, and download comprehensive platform performance sheets.</p>
                  </div>
                  <button
                    onClick={() => adminService.downloadExcelReport()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center shadow-xs shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Download Master Excel Audit (.xlsx)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Logged Inflow Batches</span>
                    <p className="text-xl font-black text-slate-900">{inventory.length}</p>
                    <span className="text-[11px] text-slate-500 font-medium">Ready for compliance audit</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">AI Quality Diagnostics</span>
                    <p className="text-xl font-black text-emerald-600">{scansList.length}</p>
                    <span className="text-[11px] text-emerald-700 font-medium">Verified classifications</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Diverted Volume</span>
                    <p className="text-xl font-black text-blue-600">{totalActiveWeight} KG</p>
                    <span className="text-[11px] text-blue-700 font-medium">Calculated live across logs</span>
                  </div>
                </div>
              </div>

              {/* Batches Table for Reporting */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Master Waste Logs Registry</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase">
                        <th className="py-3 px-4">Batch ID</th>
                        <th className="py-3 px-4">Fabric Type</th>
                        <th className="py-3 px-4">Quantity (KG)</th>
                        <th className="py-3 px-4">Condition</th>
                        <th className="py-3 px-4">Origin Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {inventory.length > 0 ? (
                        inventory.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-3.5 px-4 font-mono font-medium text-slate-800">{item.batch_id || `BATCH-${idx + 101}`}</td>
                            <td className="py-3.5 px-4 font-medium">{item.fabric_type || item.fabric}</td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">{item.quantity || item.weight} KG</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {item.condition || 'Good'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{item.source || 'Post-Consumer'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400">
                            {loading ? 'Fetching report registry...' : 'No inventory records logged in the database.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PLATFORM ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-emerald-600" />
                  Environmental Metrics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                  Analytical Charts
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Clean Material Distribution Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Material Distribution Index</h3>
                      <p className="text-[11px] text-slate-400">Live breakdown of scanned & logged fabrics</p>
                    </div>

                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dynamicFabricData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {dynamicFabricData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      {dynamicFabricData.map((item) => (
                        <div key={item.name} className="flex items-center space-x-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-slate-700 truncate">{item.name}</span>
                          <span className="text-slate-400 font-bold ml-auto">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Waste Diversion Line Chart */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Monthly Waste Diversion (KG)</h3>
                      <p className="text-[11px] text-slate-400">Landfill weight diverted over time</p>
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

                  {/* Circularity Score Distribution Bar Chart */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 lg:col-span-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Circularity Score Distribution (%)</h3>
                      <p className="text-[11px] text-slate-400">Score spread across all processed textile scans</p>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dynamicScoreData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="range" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
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

          {/* TAB 2: AI FABRIC SCANNER */}
          {activeTab === 'scanner' && <FabricScannerComponent />}

          {/* TAB 3: WASTE INVENTORY LOGGING */}
          {activeTab === 'inventory' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-emerald-600" />
                  Log New Textile Waste Batch
                </h2>
                <p className="text-slate-500 text-xs">Add a new waste shipment</p>

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
                      <option value="Linen">Linen</option>
                      <option value="Denim">Denim</option>
                      <option value="Nylon">Nylon</option>
                      <option value="Rayon">Rayon</option>
                      <option value="Acrylic">Acrylic</option>
                      <option value="Mixed Fabrics">Mixed Fabrics</option>
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

              {/* LOGGED INVENTORY TABLE */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-bold text-slate-800">Logged Inventory Batches</h2>
                    <button
                      onClick={() => adminService.downloadExcelReport()}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center shadow-xs"
                      title="Export Excel Audit Sheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Export Excel Audit
                    </button>
                  </div>

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
                      <option value="Silk">Silk</option>
                      <option value="Linen">Linen</option>
                      <option value="Denim">Denim</option>
                      <option value="Nylon">Nylon</option>
                      <option value="Rayon">Rayon</option>
                      <option value="Acrylic">Acrylic</option>
                      <option value="Mixed Fabrics">Mixed Fabrics</option>
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

          {/* TAB 4: RECYCLING OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
                    Recycling Opportunities & Batch Matching
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Automated buyer matching based on fabric purity and batch weight.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setSelectedOppFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      selectedOppFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({matchedOpportunities.length})
                  </button>
                  <button
                    onClick={() => setSelectedOppFilter('Ready for Dispatch')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
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
                    <div key={opp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{opp.id}</span>
                          <h3 className="text-sm font-bold text-slate-900 mt-0.5">{opp.fabric}</h3>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {opp.purityScore}% AI Purity
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Batch Volume</span>
                          <span className="font-bold text-slate-800 text-sm">{opp.quantityKg} KG</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Est. Value</span>
                          <span className="font-bold text-emerald-700 text-sm">{opp.estimatedValue}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Route</span>
                          <span className="font-semibold text-slate-700">{opp.targetIndustry} • {opp.conversionRoute}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {opp.urgency}
                        </span>

                        <button
                          onClick={() => handleDispatch(opp.id)}
                          disabled={isDispatched}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center ${
                            isDispatched ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                          }`}
                        >
                          {isDispatched ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Dispatched
                            </>
                          ) : (
                            <>
                              Initiate Transfer <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-emerald-400" />
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

          {/* TAB 5: RECOVERY STATISTICS */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Total Inflow</span>
                    <Box className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{totalInflowKg.toLocaleString()} KG</p>
                  <span className="text-[11px] text-slate-400 font-medium">Recorded across all input batches</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Clean Recovered Fiber</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600">{totalRecoveredKg.toLocaleString()} KG</p>
                  <span className="text-[11px] text-emerald-700 font-bold">Usable output for spinning & yarn</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Avg. Facility Yield Rate</span>
                    <Percent className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-blue-600">{facilityYieldRate}%</p>
                  <span className="text-[11px] text-blue-700 font-bold">Closed-loop recovery efficiency</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
                      Material Inflow vs. Recovered Output (KG)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Yield comparison per textile category</p>
                  </div>

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={recoveryEfficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="fabric" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#94A3B8" fontSize={11} />
                        <Tooltip formatter={(val) => `${val} KG`} />
                        <Bar dataKey="inflow" name="Inflow (KG)" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="recovered" name="Recovered (KG)" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center">
                      <Factory className="w-4 h-4 mr-2 text-emerald-600" />
                      Processing Pathway Distribution
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Active facility route allocation</p>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processingRoutesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {processingRoutesData.map((entry, index) => (
                            <Cell key={`route-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `${val}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                    {processingRoutesData.map((item) => (
                      <div key={item.name} className="flex items-center space-x-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-slate-700 truncate">{item.name}</span>
                        <span className="text-slate-400 font-bold ml-auto">{item.value}%</span>
                      </div>
                    ))}
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

export default Dashboard;