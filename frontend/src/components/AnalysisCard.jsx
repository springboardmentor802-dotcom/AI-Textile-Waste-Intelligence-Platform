import React from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AnalysisCard({ analysis, isScanning = false }) {
  if (isScanning) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-forest-50/20 via-earth-50/20 to-forest-50/20 animate-pulse" />
        <div className="flex flex-col items-center justify-center py-12 relative z-10">
          {/* Scanning Animation */}
          <div className="relative w-48 h-48 rounded-xl border-2 border-forest-300 overflow-hidden flex items-center justify-center bg-slate-50 mb-6 shadow-inner">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-forest-500 to-transparent absolute top-0 left-0 right-0 animate-bounce shadow-[0_0_8px_rgba(77,124,100,0.8)]" style={{ animationDuration: '3s' }} />
            <svg className="w-16 h-16 text-forest-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-slate-800 animate-pulse">AI Engine Analyzing Textile...</h4>
          <p className="text-sm text-slate-500 mt-2">Extracting fiber weave, identifying composition blend, and calculating sustainability score.</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const {
    image_path,
    fabric_texture,
    fabric_pattern,
    fabric_color,
    fabric_color_hex,
    damage_detection,
    contamination_detection,
    predicted_fabric_type,
    fiber_composition,
    blend_identification,
    material_quality,
    predicted_waste_category,
    recyclability_score,
    reuse_score,
    sustainability_score,
    material_recovery_score,
    circularity_score,
  } = analysis;

  // Formatting values
  const imageUrl = image_path.startsWith('http') ? image_path : `${API_URL}${image_path}`;

  // Get color indicators for circularity category
  const getCircularityColor = (score) => {
    if (score >= 85) return { text: 'text-forest-600', bg: 'bg-forest-50 border-forest-200', label: 'Excellent Recovery Potential', hex: '#4d7c64' };
    if (score >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'High Recovery Potential', hex: '#10b981' };
    if (score >= 50) return { text: 'text-earth-600', bg: 'bg-earth-50 border-earth-200', label: 'Moderate Recovery Potential', hex: '#b9a04c' };
    if (score >= 30) return { text: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Limited Recovery Potential', hex: '#ea580c' };
    return { text: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Disposal Recommended', hex: '#dc2626' };
  };

  const statusStyle = getCircularityColor(circularity_score);

  // Recommendations mapping
  const getRecommendation = () => {
    const fab = predicted_fabric_type.toLowerCase();
    const cat = predicted_waste_category.toLowerCase();

    if (cat.includes('hazardous')) {
      return {
        strategy: 'Secure Hazardous Discard',
        action: 'Incinerate with heat recovery or dispose in registered textile landfills to prevent microplastic leaching.',
        tips: 'Keep isolated from other sorting channels.'
      };
    }
    if (cat.includes('repairable')) {
      return {
        strategy: 'Localized Patching & Resewing',
        action: 'Route to specialized repairs for seam splits and localized tears, then list on Upcycling channels.',
        tips: 'Minor sewing/mending restores full value.'
      };
    }
    if (cat.includes('reusable')) {
      return {
        strategy: 'Direct Donation & Garment Resale',
        action: 'Route to clean collection containers for thrift shops, direct garment exports, or regional charity partners.',
        tips: 'Excellent condition with no damage or staining.'
      };
    }
    if (cat.includes('upcyclable')) {
      return {
        strategy: 'Creative Upcycling',
        action: 'Cut and shred clean sections for redesign, patchwork garments, or artisan fabric assemblies.',
        tips: 'Ideal for local artist collaborations.'
      };
    }
    // Default / Recyclable
    if (fab.includes('cotton') || fab.includes('denim') || fab.includes('wool') || fab.includes('linen')) {
      return {
        strategy: 'Mechanical Fiber Pulling',
        action: 'Shred and card back into raw yarn fibers. Blend with 20% virgin cotton/wool to create high-quality recycled fabric.',
        tips: 'Fibers are highly valuable as post-consumer yarn.'
      };
    } else if (fab.includes('polyester') || fab.includes('nylon')) {
      return {
        strategy: 'Chemical Pellet Extrusion',
        action: 'Dissolve synthetics using solvent processes, filter impurities, and extrude into high-purity recycled polyester (rPET) pellets.',
        tips: 'Requires clean sorting to prevent dye contamination.'
      };
    } else {
      return {
        strategy: 'Downcycled Industrial Shredding',
        action: 'Route mixed fibers to shredders to produce soundproofing insulation pads, automotive felt stuffing, or wipers.',
        tips: 'Optimal for mixed fabric blends.'
      };
    }
  };

  const recommendation = getRecommendation();

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circularity_score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Visual Scan Banner */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-400 animate-ping" />
          <h3 className="font-semibold text-white tracking-wide uppercase text-xs">AI Computer Vision Assessment</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Model v2.4-Lightweight</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left: Image Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm aspect-square max-h-72 flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt="Textile Waste Sample" 
              className="w-full h-full object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
            {/* Pulsing Scan Annotation Overlays */}
            {damage_detection !== 'None detected' && (
              <div className="absolute top-1/4 left-1/3 group/pin cursor-pointer">
                <span className="absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-red-500 border border-white" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover/pin:opacity-100 transition-opacity whitespace-nowrap z-30 font-sans">
                  🚨 Tear/Rip Detected
                </div>
              </div>
            )}
            {contamination_detection !== 'None detected' && (
              <div className="absolute bottom-1/3 right-1/4 group/pin cursor-pointer">
                <span className="absolute inline-flex h-4 w-4 rounded-full bg-orange-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-orange-500 border border-white" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 pointer-events-none group-hover/pin:opacity-100 transition-opacity whitespace-nowrap z-30 font-sans">
                  ⚠️ Stain Detected
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-slate-300 font-mono">
              RGB: {fabric_color}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visual Properties</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Weave Texture</span>
                <span className="font-semibold text-slate-700">{fabric_texture}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Color Tone</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: fabric_color_hex }} />
                  {fabric_color}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Fabric Pattern</span>
                <span className="font-semibold text-slate-700">{fabric_pattern}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Structure Blend</span>
                <span className="font-semibold text-slate-700">{blend_identification}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Main Score Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between py-2 px-4 border-l border-r border-slate-100">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Circularity Score</span>
            
            {/* SVG Circular Ring Gauge */}
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle 
                  cx="72" cy="72" r={radius} 
                  stroke="#f1f5f9" strokeWidth="12" fill="transparent" 
                />
                {/* Value Ring */}
                <circle 
                  cx="72" cy="72" r={radius} 
                  stroke={statusStyle.hex} strokeWidth="12" fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-800">{circularity_score}%</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Score</span>
              </div>
            </div>

            <div className={`mt-5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusStyle.text} ${statusStyle.bg} tracking-wide`}>
              {statusStyle.label}
            </div>
          </div>

          <div className="w-full mt-6 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Composition & Quality</span>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">AI Composition Prediction</span>
                <span className="text-sm font-semibold text-slate-800">{fiber_composition}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Quality Class</span>
                <span className="text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                  {material_quality}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metrics & Recommendations */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          {/* Sub-metrics Slider bars */}
          <div className="flex flex-col gap-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Circular Indicators</span>
            
            {/* Recyclability */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Material Recyclability</span>
                <span className="font-semibold text-slate-700">{recyclability_score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-forest-500 h-full rounded-full transition-all duration-1000" style={{ width: `${recyclability_score}%` }} />
              </div>
            </div>

            {/* Condition */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Material Condition</span>
                <span className="font-semibold text-slate-700">{condition_score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${condition_score}%` }} />
              </div>
            </div>

            {/* Reuse Potential */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Reuse Potential</span>
                <span className="font-semibold text-slate-700">{reuse_score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${reuse_score}%` }} />
              </div>
            </div>

            {/* Sustainability Benefit */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Environmental Benefit</span>
                <span className="font-semibold text-slate-700">{sustainability_score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${sustainability_score}%` }} />
              </div>
            </div>
          </div>

          {/* Recommendations Block */}
          <div className="bg-forest-50/50 border border-forest-100/50 rounded-xl p-4">
            <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider block mb-2">Recommended Recycling Strategy</span>
            <h4 className="text-sm font-bold text-forest-900 mb-1">{recommendation.strategy}</h4>
            <p className="text-xs text-forest-800/80 leading-relaxed mb-2">{recommendation.action}</p>
            <div className="text-[10px] text-forest-600 font-medium italic border-t border-forest-100/40 pt-1.5">
              💡 {recommendation.tips}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
