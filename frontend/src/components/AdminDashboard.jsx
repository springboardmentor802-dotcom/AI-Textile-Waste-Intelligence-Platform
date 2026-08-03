import React, { useState, useEffect } from 'react';
import { RefreshCw, Leaf, Activity, Shield, Layers, Scale } from 'lucide-react';

const AdminDashboard = () => {
  // Default Fabric Categories with High-Quality Static Images
  const initialFabrics = [
    {
      id: 'cotton',
      name: 'Cotton Fabric',
      staticImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      recyclability: 88.5,
      co2Saved: 165.0,
      conditionGrade: 'Grade A - Premium',
      lastUpdated: 'Default System Baseline'
    },
    {
      id: 'denim',
      name: 'Denim Twill',
      staticImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      recyclability: 82.0,
      co2Saved: 140.5,
      conditionGrade: 'Grade B - Commercial',
      lastUpdated: 'Default System Baseline'
    },
    {
      id: 'polyester',
      name: 'Polyester / Synthetic',
      staticImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
      recyclability: 65.5,
      co2Saved: 85.0,
      conditionGrade: 'Grade C - Recycled Grade',
      lastUpdated: 'Default System Baseline'
    },
    {
      id: 'wool',
      name: 'Woolen Weave',
      staticImage: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
      recyclability: 79.0,
      co2Saved: 125.0,
      conditionGrade: 'Grade B - Fair Standard',
      lastUpdated: 'Default System Baseline'
    },
    {
      id: 'linen',
      name: 'Linen / Natural Fiber',
      staticImage: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80',
      recyclability: 92.0,
      co2Saved: 190.0,
      conditionGrade: 'Grade A - High Purity',
      lastUpdated: 'Default System Baseline'
    },
    {
      id: 'canvas',
      name: 'Heavy Duty Canvas',
      staticImage: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80',
      recyclability: 74.0,
      co2Saved: 110.0,
      conditionGrade: 'Grade C - Industrial Wear',
      lastUpdated: 'Default System Baseline'
    }
  ];

  const [fabricsList, setFabricsList] = useState(initialFabrics);
  const [overallStats, setOverallStats] = useState({
    avgRecyclability: 81.8,
    totalCo2: 815.5
  });

  // Sync Live Scans from AI Vision Scanner
  const syncLiveScannedData = () => {
    try {
      const liveScan = JSON.parse(localStorage.getItem('latest_scanned_fabric_data') || 'null');
      if (liveScan) {
        setFabricsList((prevFabrics) => {
          const updated = prevFabrics.map((fab) => {
            // Match target category or update default
            if (fab.id === liveScan.categoryKey || liveScan.fabricType.toLowerCase().includes(fab.id)) {
              return {
                ...fab,
                recyclability: liveScan.recyclability,
                co2Saved: liveScan.co2Saved,
                conditionGrade: liveScan.conditionGrade,
                lastUpdated: `Live Updated at ${liveScan.timestamp}`
              };
            }
            return fab;
          });

          // Calculate Overall Platform Averages
          const avgRec = (updated.reduce((acc, c) => acc + c.recyclability, 0) / updated.length).toFixed(1);
          const sumCo2 = updated.reduce((acc, c) => acc + c.co2Saved, 0).toFixed(1);

          setOverallStats({
            avgRecyclability: avgRec,
            totalCo2: sumCo2
          });

          return updated;
        });
      }
    } catch (err) {
      console.error("Error syncing live fabric scans:", err);
    }
  };

  useEffect(() => {
    syncLiveScannedData();
    // Poll every 2 seconds for live real-time sync when user scans images
    const interval = setInterval(syncLiveScannedData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Welcome Header */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold border border-emerald-500/30">
              Admin Command Center • Live Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Welcome Back, Admin 👋</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time monitoring of AI Fabric Recyclability Index % and Environmental Impact CO₂ Metrics.
          </p>
        </div>

        <button
          onClick={syncLiveScannedData}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Live Refresh
        </button>
      </div>

      {/* Top Platform Impact Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Overall Recyclability Average</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-800">{overallStats.avgRecyclability}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">Dynamic Live Metric</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total CO₂ Saved Across Fabrics</span>
            <Leaf className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-800">{overallStats.totalCo2} Kg</p>
          <span className="text-[11px] text-blue-600 font-medium">Environmental Impact Offset</span>
        </div>
      </div>

      {/* Live Fabric Recyclability Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-emerald-600" />
              Live Fabric Recyclability Index & Environmental Impact Monitor
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Metrics for each fabric dynamically update in real-time whenever a user runs an AI Vision Scan.
            </p>
          </div>
        </div>

        {/* Fabrics Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fabricsList.map((fabric) => (
            <div 
              key={fabric.id} 
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 hover:shadow-md transition flex flex-col justify-between"
            >
              
              {/* Fixed High-Quality Static Fabric Image */}
              <div className="relative h-44 w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                <img 
                  src={fabric.staticImage} 
                  alt={fabric.name} 
                  className="w-full h-full object-cover" 
                />
                <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white font-mono text-[10px] px-2.5 py-1 rounded-md backdrop-blur-sm">
                  {fabric.name}
                </span>
              </div>

              {/* Point 1: Live Recyclability Index % with Animated Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Live Recyclability Index</span>
                  <span className="font-black text-emerald-600 text-base">{fabric.recyclability}%</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm" 
                    style={{ width: `${Math.min(fabric.recyclability, 100)}%` }}
                  />
                </div>
              </div>

              {/* Point 2: Real-time CO2 Savings & Condition Grade */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider">
                    CO₂ Saved
                  </span>
                  <span className="font-extrabold text-emerald-700 text-sm block">
                    🌱 {fabric.co2Saved} Kg
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5 shadow-2xs">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px] tracking-wider">
                    Condition Grade
                  </span>
                  <span className="font-extrabold text-slate-800 text-xs block leading-tight">
                    {fabric.conditionGrade}
                  </span>
                </div>
              </div>

              {/* Timestamp status */}
              <p className="text-[10px] text-slate-400 font-mono text-right italic pt-1">
                {fabric.lastUpdated}
              </p>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;