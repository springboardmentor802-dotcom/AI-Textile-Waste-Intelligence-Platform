import React, { useState } from 'react';

// Recyclability Scoring & Assessment Rules Database
const assessmentRules = {
  "cotton": { baseScore: 90, recyclability: "High (Mechanical / Chemical)", method: "Fiber shredding or chemical depolymerization" },
  "denim": { baseScore: 85, recyclability: "High (Mechanical)", method: "Shredding for insulation or open-loop yarn spinning" },
  "polyester": { baseScore: 80, recyclability: "High (Chemical / rPET)", method: "Melting and re-spinning into polyester flakes/yarn" },
  "wool": { baseScore: 75, recyclability: "Medium-High", method: "Scouring and carding back into woolen yarn" },
  "silk": { baseScore: 60, recyclability: "Medium", method: "Specialized protein fiber chemical recovery or artisan upcycling" },
  "mixed": { baseScore: 30, recyclability: "Low (Complex Separation)", method: "Industrial downcycling or energy recovery due to blend matrix" }
};

export default function RecyclabilityAssessment() {
  const [selectedMaterial, setSelectedMaterial] = useState("cotton");
  const [condition, setCondition] = useState("good"); // good, worn, damaged
  const [contamination, setContamination] = useState("clean"); // clean, slight, heavy
  const [assessmentResult, setAssessmentResult] = useState(null);

  const calculateAssessment = () => {
    let materialData = assessmentRules[selectedMaterial] || assessmentRules["cotton"];
    let score = materialData.baseScore;

    // Condition penalty/bonus
    if (condition === "worn") score -= 10;
    if (condition === "damaged") score -= 25;

    // Contamination penalty
    if (contamination === "slight") score -= 15;
    if (contamination === "heavy") score -= 40;

    score = Math.max(0, score); // Ensure score doesn't drop below 0

    let tier = "Optimal Circularity";
    if (score < 40) tier = "Low Feasibility (Landfill / Energy Recovery)";
    else if (score < 70) tier = "Moderate (Requires Pre-processing)";

    setAssessmentResult({
      score,
      tier,
      recyclability: materialData.recyclability,
      recommendedMethod: materialData.method,
      status: score >= 50 ? "Recyclable / Reusable" : "Non-Recyclable (Downcycle Required)"
    });
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '30px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      
      <h2 style={{ color: '#132e14', marginBottom: '8px', fontSize: '1.6rem' }}>♻️ Textile Recyclability Assessment System</h2>
      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px' }}>
        Evaluate fabric recovery potential, circularity scores, and waste processing routes based on material composition and wear conditions.
      </p>

      {/* Input Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '25px' }}>
        
        {/* Material Selection */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}>
            Select Fabric Material Type:
          </label>
          <select 
            value={selectedMaterial} 
            onChange={(e) => setSelectedMaterial(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#f8fafc' }}
          >
            <option value="cotton">100% Cotton</option>
            <option value="denim">Denim (Cotton Twill)</option>
            <option value="polyester">Polyester (Synthetic)</option>
            <option value="wool">Wool (Animal Protein)</option>
            <option value="silk">Silk</option>
            <option value="mixed">Mixed Blends / Poly-Cotton / Spandex</option>
          </select>
        </div>

        {/* Condition Selection */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}>
            Garment / Waste Condition:
          </label>
          <select 
            value={condition} 
            onChange={(e) => setCondition(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#f8fafc' }}
          >
            <option value="good">Good (Intact, Wearable / Reusable)</option>
            <option value="worn">Worn (Faded, Slight Wear)</option>
            <option value="damaged">Damaged (Torn, Ripped, Cut Pieces)</option>
          </select>
        </div>

        {/* Contamination Level */}
        <div>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}>
            Contamination / Chemical Treatment:
          </label>
          <select 
            value={contamination} 
            onChange={(e) => setContamination(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: '#f8fafc' }}
          >
            <option value="clean">Clean (No chemical or severe stains)</option>
            <option value="slight">Slightly Soiled (Washable stains or zippers/buttons attached)</option>
            <option value="heavy">Heavily Contaminated (Oil, paint, harsh chemicals, waterproof coatings)</option>
          </select>
        </div>

      </div>

      <button 
        onClick={calculateAssessment}
        style={{ width: '100%', backgroundColor: '#1b4d3e', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}
      >
        Run Recyclability Assessment
      </button>

      {/* Assessment Output Dashboard */}
      {assessmentResult && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
          <h3 style={{ color: '#166534', margin: '0 0 15px 0', fontSize: '1.2rem' }}>📊 Assessment Result Report</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: '0.8rem', color: '#65a30d', fontWeight: '700' }}>CIRCULARITY SCORE</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#14532d' }}>{assessmentResult.score} / 100</div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: '0.8rem', color: '#65a30d', fontWeight: '700' }}>CLASSIFICATION TIER</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#14532d', marginTop: '6px' }}>{assessmentResult.tier}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.5' }}>
            <p style={{ margin: '6px 0' }}><strong>Feasibility Status:</strong> {assessmentResult.status}</p>
            <p style={{ margin: '6px 0' }}><strong>Target Technology:</strong> {assessmentResult.recyclability}</p>
            <p style={{ margin: '6px 0' }}><strong>Recommended Workflow:</strong> {assessmentResult.recommendedMethod}</p>
          </div>
        </div>
      )}

    </div>
  );
}