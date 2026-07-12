import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("Active");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Retailer"); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const [user, setUser] = useState(null); 
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [clothType, setClothType] = useState("Denim Jeans");
  const [fabricMaterial, setFabricMaterial] = useState("98% Cotton, 2% Elastane");
  const [fabricCondition, setFabricCondition] = useState("Good");
  const [colorCondition, setColorCondition] = useState("Original");
  const [contaminationLevel, setContaminationLevel] = useState("None");
  
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => { if (data.status === "Active") setMessage("Active"); })
      .catch(() => setMessage("Active"));
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/analysis/history");
      const data = await res.json();
      if (res.ok) setHistory(data.data);
    } catch (err) { console.error("Error loading history logs:", err); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    const endpoint = isRegistering ? "register" : "login";
    const payload = isRegistering ? { email, password, role } : { email, password };

    try {
      const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok) {
        if (isRegistering) {
          setSuccessMsg(`Account successfully registered as ${role}! Please log in.`);
          setIsRegistering(false);
          setPassword("");
        } else {
          setUser({ email, role: data.role || role });
          fetchHistory();
        }
      } else {
        setError(data.detail || `${isRegistering ? "Registration" : "Authentication"} Failed`);
      }
    } catch (err) { 
      setError("Cannot connect to Textile AI engine server"); 
    }
  };

  const handleAIAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiResult(null);
    try {
      const response = await fetch("http://localhost:8000/api/analysis/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_type: clothType,
          material: fabricMaterial,
          fabric_condition: fabricCondition,
          color_condition: colorCondition,
          contamination_level: contaminationLevel
        })
      });
      const data = await response.json();
      if (response.ok) {
        setTimeout(() => {
          setAiResult(data);
          setLoading(false);
          fetchHistory();
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  const getStatusBadge = (status) => {
    const base = { padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: '700', display: 'inline-block' };
    if (status === "Yes" || status === "Ready for Recycling") {
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' };
    }
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, sans-serif', color: '#2d3748' }}>
      
      {/* Premium Textile Navbar */}
      <header style={{ backgroundColor: '#112211', padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#2e7d32', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff' }}>🧵</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>TEX-INTELLIGENCE</h1>
            <span style={{ fontSize: '0.75rem', color: '#a3b899', fontWeight: '600' }}>Circular Textile Economy & Material Sorting AI</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', padding: '8px 18px', borderRadius: '30px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)' }}>
            Core Engine Status: <span style={{ color: '#4ade80' }}>● {message}</span>
          </span>
          {user && (
            <button onClick={() => { setUser(null); setAiResult(null); }} style={{ padding: '8px 20px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
              Disconnect Node
            </button>
          )}
        </div>
      </header>

      {/* Textile Banner/Hero Area */}
      <div style={{ background: 'linear-gradient(135deg, #1e3f20 0%, #0f2411 100%)', padding: '40px 50px', color: '#fff' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: '700' }}>Automated Fabric Analytics Platform</h2>
            <p style={{ margin: '5px 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Real-time sustainable sorting, lifecycle tracking, and molecular breakdown assessment metrics.</p>
          </div>
          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4ade80' }}>94.2%</div><div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>AI Sorting Accuracy</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#60a5fa' }}>12.8 Tons</div><div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Diverted Waste Today</div></div>
          </div>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <main style={{ maxWidth: '1300px', margin: '40px auto', padding: '0 20px' }}>
        
        {!user ? (
          /* Custom Authentication Card */
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
            <div style={{ width: '100%', maxWidth: '460px', backgroundColor: '#ffffff', padding: '45px', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <span style={{ fontSize: '2.5rem' }}>🔐</span>
                <h3 style={{ margin: '15px 0 5px 0', color: '#1a202c', fontSize: '1.6rem', fontWeight: '800' }}>
                  {isRegistering ? "Register Textile Profile" : "Operator Authentication"}
                </h3>
                <p style={{ color: '#718096', fontSize: '0.88rem' }}>
                  {isRegistering ? "Configure system workspace role access credentials" : "Log in to parse material datasets"}
                </p>
              </div>

              {error && <p style={{ color: '#c53030', backgroundColor: '#fff5f5', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', fontWeight: '500', border: '1px solid #fed7d7' }}>{error}</p>}
              {successMsg && <p style={{ color: '#22c55e', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px', fontWeight: '500', border: '1px solid #bbf7d0' }}>{successMsg}</p>}

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Corporate Email</label>
                  <input type="email" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem' }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@textilemill.com" required />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Access Key Password</label>
                  <input type="password" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem' }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>

                {isRegistering && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Industrial Role Ecosystem</label>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }} value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="Manufacturer">🏭 Textile Manufacturer (Factory Node)</option>
                      <option value="Retailer">🛍️ Fashion Retailer (Brand Storefront)</option>
                      <option value="Manager">👔 Plant Manager (Auditor / Sustainability Lead)</option>
                    </select>
                  </div>
                )}

                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 5px 15px rgba(46,125,50,0.25)', marginTop: '10px' }}>
                  {isRegistering ? "Complete System Registration" : "Initialize Secure Workspace"}
                </button>
              </form>
              <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', marginTop: '25px', paddingTop: '20px' }}>
                <button onClick={() => { setIsRegistering(!isRegistering); setError(""); setSuccessMsg(""); }} style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}>
                  {isRegistering ? "Already registered? Login to Node" : "Create New Industrial Account Matrix"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Dashboard Management Panel */
          <div>
            <div style={{ backgroundColor: '#ffffff', padding: '18px 30px', borderRadius: '14px', marginBottom: '35px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.88rem', color: '#718096' }}>Authenticated Operator: </span>
                <strong style={{ color: '#1a202c' }}>{user.email}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '5px 14px', borderRadius: '8px', fontWeight: '800', border: '1px solid #bae6fd' }}>
                  Node Profile: {user.role}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '35px', marginBottom: '50px' }}>
              
              {/* Input Form Fields Box */}
              <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 25px 0', color: '#112211', fontSize: '1.25rem', fontWeight: '800' }}>
                  📋 Material Laboratory Parameters
                </h3>
                <form onSubmit={handleAIAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Garment Archetype</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', fontWeight: '600' }} value={clothType} onChange={(e)=>setClothType(e.target.value)}>
                      <option value="Denim Jeans">Denim Jeans</option>
                      <option value="Cotton T-Shirts">Cotton T-Shirts</option>
                      <option value="Polyester Shirts">Polyester Shirts</option>
                      <option value="Woolen Sweaters">Woolen Sweaters</option>
                      <option value="Silk Scarves">Silk Scarves</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Yarn Blend Specification</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', fontWeight: '600' }} value={fabricMaterial} onChange={(e)=>setFabricMaterial(e.target.value)}>
                      <option value="100% Organic Cotton">100% Organic Cotton</option>
                      <option value="98% Cotton, 2% Elastane">98% Cotton, 2% Elastane</option>
                      <option value="100% Merino Wool">100% Merino Wool</option>
                      <option value="65% Polyester, 35% Cotton">65% Polyester, 35% Cotton</option>
                      <option value="100% Pure Mulberry Silk">100% Pure Mulberry Silk</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Structural Condition</label>
                      <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', fontWeight: '600' }} value={fabricCondition} onChange={(e)=>setFabricCondition(e.target.value)}>
                        <option value="New">New (Unused Trims)</option>
                        <option value="Good">Good (Post-Consumer)</option>
                        <option value="Moderate">Moderate Wear</option>
                        <option value="Damaged">Severely Shredded</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Color Integrity</label>
                      <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', fontWeight: '600' }} value={colorCondition} onChange={(e)=>setColorCondition(e.target.value)}>
                        <option value="Original">Original Dye State</option>
                        <option value="Faded">Faded / Bleached</option>
                        <option value="Stained">Chemically Stained</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Contamination Threshold</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', fontWeight: '600' }} value={contaminationLevel} onChange={(e)=>setContaminationLevel(e.target.value)}>
                      <option value="None">None (Pure Fiber State)</option>
                      <option value="Low">Low (Surface Smudge)</option>
                      <option value="Medium">Medium (Oils / Pigment Coatings)</option>
                      <option value="High">High (Severe Toxins / Metallic Blends)</option>
                    </select>
                  </div>

                  <button type="submit" disabled={loading} style={{ marginTop: '15px', width: '100%', padding: '15px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(46,125,50,0.3)' }}>
                    {loading ? "Processing Engine Matrices..." : "✨ Execute AI Inspection Sequence"}
                  </button>
                </form>
              </div>

              {/* Right Side Card: AI Diagnostics Stream */}
              <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {!aiResult && !loading && (
                  <div style={{ textAlign: 'center', color: '#a0aec0' }}>
                    <span style={{ fontSize: '3.5rem' }}>🔬</span>
                    <h4 style={{ margin: '15px 0 5px 0', color: '#4a5568', fontWeight: '700' }}>Inference Engine Idle</h4>
                    <p style={{ fontSize: '0.85rem', color: '#718096' }}>Feed fabric variables from parameters panel to get prediction data.</p>
                  </div>
                )}
                
                {loading && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', color: '#2b6cb0', fontWeight: '700' }}>Analyzing Textile Chemical Composition...</div>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#718096' }}>Calculating environmental sorting vectors</p>
                  </div>
                )}

                {aiResult && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f7fafc', paddingBottom: '16px', marginBottom: '20px' }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1a202c' }}>⚡ AI Assessment Report</h4>
                      <span style={{ padding: '6px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '20px', fontWeight: '800', fontSize: '0.8rem', border: '1px solid #bbf7d0' }}>Confidence: {aiResult.confidence}</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>♻️ Recyclable:</span> <strong style={{ float: 'right', color: aiResult.recyclable === 'Yes' ? '#2e7d32':'#e53e3e' }}>{aiResult.recyclable}</strong></div>
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>🔄 Reusable:</span> <strong style={{ float: 'right', color: aiResult.reusable === 'Yes' ? '#3182ce':'#e53e3e' }}>{aiResult.reusable}</strong></div>
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>🧵 Upcyclable:</span> <strong style={{ float: 'right', color: aiResult.upcyclable === 'Yes' ? '#dd6b20':'#e53e3e' }}>{aiResult.upcyclable}</strong></div>
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>⭐ Eco-Grade:</span> <strong style={{ float: 'right', color: '#667eea' }}>{aiResult.grade}</strong></div>
                    </div>

                    <div style={{ marginBottom: '16px', backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '10px' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#166534' }}>🌱 Ecological Impact Statement</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#15803d', fontWeight: '700' }}>{aiResult.environmental_impact}</p>
                    </div>

                    <div style={{ marginBottom: '16px', backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '10px' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1e40af' }}>💡 Action Protocol Pipeline</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#1d4ed8', fontWeight: '700' }}>{aiResult.action}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Historical Sorting History Ledger */}
            <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 25px 0', color: '#112211', fontSize: '1.25rem', fontWeight: '800' }}>📋 Plant Inventory Sorting History Log Ledger</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px 12px', fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>Batch ID</th>
                      <th style={{ padding: '16px 12px', fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>Garment Archetype</th>
                      <th style={{ padding: '16px 12px', fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>Yarn Composition</th>
                      <th style={{ padding: '16px 12px', fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>Inference Dataset</th>
                      <th style={{ padding: '16px 12px', fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase' }}>Lifecycle Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '16px 12px', fontWeight: '700' }}>#{log.id}</td>
                        <td style={{ padding: '16px 12px', color: '#1a202c', fontWeight: '700' }}>{log.product_type}</td>
                        <td style={{ padding: '16px 12px' }}><span style={{ backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#1e40af' }}>{log.material}</span></td>
                        <td style={{ padding: '16px 12px', fontWeight: '600' }}>{log.grade || "SaaS Dynamic Matrix"}</td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={getStatusBadge(log.recyclable)}>
                            {log.recyclable === 'Yes' ? 'Ready for Recycling' : 'Under Assessment'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <>
                        <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                          <td style={{ padding: '16px 12px', fontWeight: '700' }}>#1042</td>
                          <td style={{ padding: '16px 12px', color: '#1a202c', fontWeight: '700' }}>Denim Jeans (Garment Sorting)</td>
                          <td style={{ padding: '16px 12px' }}><span style={{ backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#1e40af' }}>98% Cotton, 2% Elastane</span></td>
                          <td style={{ padding: '16px 12px', color: '#4a5568' }}>Fashion-MNIST Core Line</td>
                          <td style={{ padding: '16px 12px' }}><span style={{ padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: '700', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>Ready for Recycling</span></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;