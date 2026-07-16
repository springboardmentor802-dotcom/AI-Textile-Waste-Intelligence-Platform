import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Layers, 
  Activity, 
  AlertTriangle, 
  Plus, 
  Calendar,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { apiRequest, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await apiRequest('/api/inventory/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      } else {
        throw new Error('Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Analyzing inventory trends...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center">
        <h3 className="font-bold text-lg mb-2">Error Loading Dashboard</h3>
        <p className="text-sm">{error || 'Please make sure the backend server is running and try again.'}</p>
        <button 
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          className="mt-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  // Circular Economy Metrics calculations (CO2 savings of ~4kg per kg, water savings of ~2500L per kg of recycled cotton/denim)
  const co2Savings = (data.total_quantity * 4.2).toFixed(1);
  const waterSavings = (data.total_quantity * 2.5).toFixed(0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gradient-to-r from-forest-800 to-forest-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(252,251,247,0.06),transparent_60%)]"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-xs uppercase tracking-wider text-earth-300 font-bold">Textile Waste Intelligence</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            Hello, {user.name}
          </h2>
          <p className="text-sm text-forest-200 font-medium max-w-xl">
            {user.role === 'Textile Manufacturer' 
              ? `Track your facility's textile scrap batches, review processing statuses, and monitor carbon diversion goals.`
              : `Review recycling throughputs, process pending batches, and manage material lifecycle stages.`}
          </p>
        </div>
        {(user.role === 'Textile Manufacturer' || user.role === 'Administrator') && (
          <Link 
            to="/inventory/new" 
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 bg-earth-500 hover:bg-earth-600 text-forest-950 font-bold px-5 py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] relative z-10"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Register Batch</span>
          </Link>
        )}
      </div>

      {/* Numerical Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="bg-forest-50 p-3 rounded-xl text-forest-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Batches</span>
            <span className="text-2xl font-extrabold text-slate-800">{data.total_batches}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="bg-earth-50 p-3 rounded-xl text-earth-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Weight</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {data.total_quantity.toLocaleString()} <span className="text-xs font-semibold text-slate-400">kg/lbs</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <TrendingUp className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Est. CO₂ Diverted</span>
            <span className="text-2xl font-extrabold text-emerald-800">
              {Number(co2Savings).toLocaleString()} <span className="text-xs font-semibold text-emerald-400">kg</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Water Preserved</span>
            <span className="text-2xl font-extrabold text-blue-800">
              {Number(waterSavings).toLocaleString()} <span className="text-xs font-semibold text-blue-400">L</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Condition breakdown & Recent list */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Condition & Status Charts */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Batches by Condition Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Batch Condition</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Material sorting classifications</p>
            </div>

            <div className="space-y-4">
              {data.batches_by_condition.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No condition data found.</p>
              ) : (
                data.batches_by_condition.map((c) => {
                  const percent = data.total_quantity > 0 ? (c.total_quantity / data.total_quantity) * 100 : 0;
                  const colorMap = {
                    'Clean': 'bg-emerald-500',
                    'Damaged': 'bg-amber-500',
                    'Contaminated': 'bg-rose-500',
                    'Wet': 'bg-blue-500'
                  };
                  const color = colorMap[c.condition] || 'bg-slate-500';
                  
                  return (
                    <div key={c.condition} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span className="flex items-center space-x-1.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${color}`}></span>
                          <span>{c.condition} ({c.count})</span>
                        </span>
                        <span>{percent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="block text-[10px] text-slate-400 text-right leading-none -mt-1 font-semibold">
                        {c.total_quantity.toLocaleString()} units
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Batches by Status Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Processing Pipeline</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Current collection pipeline stages</p>
            </div>

            <div className="space-y-3.5">
              {data.batches_by_status.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No pipeline data found.</p>
              ) : (
                data.batches_by_status.map((s) => {
                  const statusColors = {
                    'Pending': 'bg-slate-100 text-slate-700 border-slate-200',
                    'Sorting': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Recycled': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Disposed': 'bg-rose-50 text-rose-700 border-rose-200'
                  };
                  const colors = statusColors[s.status] || 'bg-slate-50 text-slate-700 border-slate-200';
                  
                  return (
                    <div key={s.status} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${colors}`}>
                        {s.status}
                      </span>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-slate-700">{s.count} batches</span>
                        <span className="block text-[10px] text-slate-400 font-semibold">{s.total_quantity} units</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Recent Collections & Attention-needed Batches */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Attention Needed Batches */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Attention Needed</h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {data.attention_needed_batches.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-xs text-slate-400 block font-medium">All batches sorted & healthy!</span>
                </div>
              ) : (
                data.attention_needed_batches.map((b) => (
                  <div key={b.batch_id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <Link to={`/inventory/${b.batch_id}`} className="text-sm font-bold text-slate-800 hover:text-forest-600 transition-colors">
                        {b.batch_id}
                      </Link>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-600">{b.fabric_type}</span>
                        <span>•</span>
                        <span>{b.quantity} {b.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        b.condition === 'Contaminated' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        b.condition === 'Damaged' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {b.condition}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{b.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Collections */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg leading-tight">Recent Collections</h3>
              <Link to="/inventory" className="text-xs font-bold text-forest-600 hover:underline flex items-center space-x-0.5">
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Batch ID</th>
                    <th className="pb-3">Fabric</th>
                    <th className="pb-3">Source</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.recent_collections.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400 font-medium">No recent collections found.</td>
                    </tr>
                  ) : (
                    data.recent_collections.map((b) => (
                      <tr key={b.batch_id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-3.5 font-bold text-slate-800">
                          <Link to={`/inventory/${b.batch_id}`} className="hover:underline hover:text-forest-600">
                            {b.batch_id}
                          </Link>
                        </td>
                        <td className="py-3.5 font-medium text-slate-600">{b.fabric_type}</td>
                        <td className="py-3.5 text-slate-500 font-medium max-w-[120px] truncate">{b.source}</td>
                        <td className="py-3.5 text-right font-bold text-slate-800">{b.quantity} {b.unit}</td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            b.status === 'Pending' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                            b.status === 'Sorting' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            b.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            b.status === 'Recycled' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-rose-50 text-rose-600 border-rose-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
