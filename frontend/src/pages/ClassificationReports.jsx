import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Printer, ShieldCheck, TrendingUp, Droplet, Leaf, HardDrive, RefreshCw } from 'lucide-react';

export default function ClassificationReports() {
  const { apiRequest, token, API_URL } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchSummaryReport = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/analysis/reports/summary');
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      } else {
        throw new Error('Failed to load reports summary');
      }
    } catch (err) {
      setError(err.message || 'Error occurred loading reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center max-w-xl mx-auto mt-12">
        <h3 className="font-bold text-lg mb-2">Failed to Generate Report</h3>
        <p className="text-sm">{error || 'Could not load classification analytics statistics.'}</p>
        <button onClick={fetchSummaryReport} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow hover:bg-rose-700">
          Try Again
        </button>
      </div>
    );
  }

  const {
    total_batches,
    total_weight,
    total_analyzed,
    fabric_stats = [],
    category_stats = [],
    quality_stats = [],
    avg_scores = {},
    environmental_impact = {}
  } = data;

  // Max weight for scale charting
  const maxFabricWeight = Math.max(...fabric_stats.map(f => f.weight), 1);
  const maxCategoryWeight = Math.max(...category_stats.map(c => c.weight), 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto print:p-0 print:space-y-4">
      {/* Print stylesheet style injection */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4 no-print">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">
            Textile Waste Classification Report
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Real-time aggregates of fiber materials, recyclability assessments, and circularity audits
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchSummaryReport}
            className="inline-flex items-center space-x-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Sync Stats</span>
          </button>
          
          <button 
            onClick={handlePrint}
            className="inline-flex items-center space-x-1 bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Textile Waste Intelligence Platform</h1>
        <p className="text-sm font-bold text-slate-500 mt-1">CIRCULARITY AUDIT & CLASSIFICATION SUMMARY REPORT</p>
        <div className="flex justify-between text-xs text-slate-400 mt-4 font-mono">
          <span>Generated: {new Date().toLocaleString()}</span>
          <span>Scope: All Registered Batches</span>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Weight */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between print-card">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Diverted Waste</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{total_weight.toLocaleString()} kg</span>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold mt-3">{total_batches} registered batches in database</span>
        </div>

        {/* AI Analyzed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between print-card">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Audited Samples</span>
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">{total_analyzed} / {total_batches}</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-forest-500 h-full rounded-full" style={{ width: `${(total_analyzed/Math.max(total_batches, 1))*100}%` }} />
          </div>
        </div>

        {/* CO2 Savings */}
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between print-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Est. CO₂ Offset</span>
              <span className="text-2xl font-extrabold text-emerald-950 mt-1 block">-{environmental_impact.co2_saved_kg?.toLocaleString()} kg</span>
            </div>
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[9px] text-emerald-700 font-medium mt-3">Equivalent greenhouse gas emissions prevented</span>
        </div>

        {/* Water Preserved */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between print-card">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Est. Water Saved</span>
              <span className="text-2xl font-extrabold text-blue-950 mt-1 block">-{environmental_impact.water_saved_liters?.toLocaleString()} L</span>
            </div>
            <Droplet className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-[9px] text-blue-700 font-medium mt-3">Avoided raw fabric production water footprint</span>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fabric Type Volume chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 print-card">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Volume Weight by Fabric Type</h3>
            <p className="text-[10px] text-slate-400">Total processed weight in kilograms across registered categories</p>
          </div>
          
          <div className="space-y-4">
            {fabric_stats.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No fabric data logged yet.</p>
            ) : (
              fabric_stats.map((stat, i) => {
                const percentage = (stat.weight / maxFabricWeight) * 100;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{stat.fabric}</span>
                      <span>{stat.weight.toLocaleString()} kg</span>
                    </div>
                    <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                      <div className="bg-forest-600 h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Circularity Performance averages */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 print-card">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">AI Circular Assessment Audits</h3>
            <p className="text-[10px] text-slate-400">Average scores computed from AI image analysis engines</p>
          </div>

          {total_analyzed === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <ShieldCheck className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 font-medium">No Image Analyses Completed Yet</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mt-1">Upload photos to waste batches to activate AI circularity scores.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              
              {/* Circularity Gauge */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center justify-center">
                <span className="text-3xl font-extrabold text-forest-700">{avg_scores.circularity}%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Avg Circularity Index</span>
                <span className="text-[9px] bg-forest-100/50 text-forest-800 px-2.5 py-0.5 rounded-full mt-3 font-semibold">
                  Overall rating
                </span>
              </div>

              {/* Individual sub score checklist */}
              <div className="space-y-3.5 bg-slate-50 rounded-2xl p-4 border border-slate-100 justify-center flex flex-col">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                    <span>Recyclability</span>
                    <span>{avg_scores.recyclability}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-forest-500 h-full rounded-full" style={{ width: `${avg_scores.recyclability}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                    <span>Reuse Potential</span>
                    <span>{avg_scores.reuse}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${avg_scores.reuse}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                    <span>Sustainability</span>
                    <span>{avg_scores.sustainability}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${avg_scores.sustainability}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                    <span>Material Recovery</span>
                    <span>{avg_scores.material_recovery}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${avg_scores.material_recovery}%` }} />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Waste Category breakdown and quality chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Waste categories weight chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 print-card">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Waste Categorization Weights</h3>
            <p className="text-[10px] text-slate-400">Audited volume distributed by recommended sorting channel</p>
          </div>

          <div className="space-y-4">
            {category_stats.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No AI sorting reports logged yet.</p>
            ) : (
              category_stats.map((stat, i) => {
                const percentage = (stat.weight / maxCategoryWeight) * 100;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{stat.category}</span>
                      <span>{stat.weight.toLocaleString()} kg</span>
                    </div>
                    <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                      <div className="bg-earth-500 h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quality Rating breakdown stats */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 print-card">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Textile Fabric Quality Grades</h3>
            <p className="text-[10px] text-slate-400">Total batch counts classified by structural material quality</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {quality_stats.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8 col-span-2">No audited samples yet.</p>
            ) : (
              quality_stats.map((stat, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">{stat.quality} Quality</span>
                    <span className="text-xl font-extrabold text-slate-800 mt-1">{stat.count} batches</span>
                  </div>
                  <ShieldCheck className={`w-6 h-6 ${
                    stat.quality === 'Premium' ? 'text-forest-600' :
                    stat.quality === 'Good' ? 'text-emerald-500' :
                    stat.quality === 'Fair' ? 'text-amber-500' :
                    'text-red-500'
                  }`} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
