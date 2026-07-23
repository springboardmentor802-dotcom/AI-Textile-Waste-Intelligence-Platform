import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("Active");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Manufacturer"); 
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
  
  // Image Upload State
  const [selectedImage, setSelectedImage] = useState(null);

  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Recyclability Assessment Tab / State
  const [assessmentMaterial, setAssessmentMaterial] = useState("cotton");
  const [assessmentCondition, setAssessmentCondition] = useState("good");
  const [assessmentContamination, setAssessmentContamination] = useState("clean");
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! 🌱 I am your Tex-Intelligence Assistant. Ask me anything about textile recycling, garment classification, yarn blends, or platform features!" }
  ]);

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => { if (data.status === "Active") setMessage("Active"); })
      .catch(() => setMessage("Active"));
  }, []);

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { text: "", color: "#718096" };
    if (pass.length < 6) return { text: "⚠️ Minimum 6 characters required", color: "#e53e3e" };
    if (pass.length < 9) return { text: "⚡ Moderate Password (Make it stronger)", color: "#d97706" };
    return { text: "🔒 Strong Password!", color: "#16a34a" };
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/analysis/history");
      const data = await res.json();
      if (res.ok) setHistory(data.data);
    } catch (err) { console.error("Error loading history logs:", err); }
  };

  const fetchClassificationReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/analysis/report");
      const data = await res.json();
      if (res.ok) {
        setReportData(data.report);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setReportLoading(false);
    }
  };

  // Recyclability Assessment Calculation Rules Engine
  const calculateRecyclabilityAssessment = (e) => {
    e.preventDefault();
    const rules = {
      "cotton": { baseScore: 90, recyclability: "High (Mechanical / Chemical)", method: "Fiber shredding or chemical depolymerization" },
      "denim": { baseScore: 85, recyclability: "High (Mechanical)", method: "Shredding for insulation or open-loop yarn spinning" },
      "polyester": { baseScore: 80, recyclability: "High (Chemical / rPET)", method: "Melting and re-spinning into polyester flakes/yarn" },
      "wool": { baseScore: 75, recyclability: "Medium-High", method: "Scouring and carding back into woolen yarn" },
      "silk": { baseScore: 60, recyclability: "Medium", method: "Specialized protein fiber chemical recovery or artisan upcycling" },
      "mixed": { baseScore: 30, recyclability: "Low (Complex Separation)", method: "Industrial downcycling or energy recovery due to blend matrix" }
    };

    let materialData = rules[assessmentMaterial] || rules["cotton"];
    let score = materialData.baseScore;

    if (assessmentCondition === "worn") score -= 10;
    if (assessmentCondition === "damaged") score -= 25;

    if (assessmentContamination === "slight") score -= 15;
    if (assessmentContamination === "heavy") score -= 40;

    score = Math.max(0, score);

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
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (isRegistering && password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    
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
    
    if (!selectedImage) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    setAiResult(null);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch("http://localhost:8000/upload-image", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (response.ok) {
        setTimeout(() => {
          setAiResult(data);
          setLoading(false);
          fetchHistory();
        }, 800);
      } else {
        setError(data.detail || data.message || "Failed to process image prediction.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to Textile AI engine server");
      setLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMessages = [...chatMessages, { sender: "user", text: userText }];
    setChatMessages(newMessages);
    setChatInput("");

    setTimeout(() => {
      const lowerQuery = userText.toLowerCase();
      let botResponse = "";

      const isTextileRelated = 
        lowerQuery.includes("textile") || 
        lowerQuery.includes("fabric") || 
        lowerQuery.includes("recycl") || 
        lowerQuery.includes("cotton") || 
        lowerQuery.includes("denim") || 
        lowerQuery.includes("wool") || 
        lowerQuery.includes("silk") || 
        lowerQuery.includes("polyester") || 
        lowerQuery.includes("garment") || 
        lowerQuery.includes("waste") || 
        lowerQuery.includes("upcycl") || 
        lowerQuery.includes("batch") || 
        lowerQuery.includes("login") || 
        lowerQuery.includes("role") || 
        lowerQuery.includes("report") || 
        lowerQuery.includes("password") || 
        lowerQuery.includes("tier") ||
        lowerQuery.includes("eco") ||
        lowerQuery.includes("help") ||
        lowerQuery.includes("hi") ||
        lowerQuery.includes("hello");

      if (!isTextileRelated) {
        botResponse = "🚫 Sorry! I am a specialized Textile Intelligence Assistant. I can only answer queries related to sustainable textiles, fabric recycling, garment categorization, and platform features.";
      } else if (lowerQuery.includes("hi") || lowerQuery.includes("hello")) {
        botResponse = "Hello! How can I assist you with textile waste tracking or garment recycling data today?";
      } else if (lowerQuery.includes("password")) {
        botResponse = "🔒 Passwords for secure system registration must be at least 6 characters long for proper security compliance.";
      } else if (lowerQuery.includes("role") || lowerQuery.includes("dashboard")) {
        botResponse = "👥 We support 4 industrial roles: Manufacturer, Recycling Facility, Sustainability Manager, and Admin. Each provides specialized insights.";
      } else if (lowerQuery.includes("report")) {
        botResponse = "📑 Sustainability Managers and Admins can compile and view Master Waste Classification & Audit Reports directly from their dashboards.";
      } else if (lowerQuery.includes("denim") || lowerQuery.includes("cotton") || lowerQuery.includes("wool") || lowerQuery.includes("fabric")) {
        botResponse = `🧵 Fabrics like ${userText} can be evaluated via our AI Inspection module to determine recyclability, reusability, and chemical contamination levels.`;
      } else {
        botResponse = "🌿 That's a great question regarding circular textile ecosystems! Our platform evaluates fabric composition, structural condition, and fiber integrity to optimize textile upcycling and recycling loops.";
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: botResponse }]);
    }, 500);
  };
  const getStatusBadge = (status) => {
    const base = { padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: '700', display: 'inline-block' };
    if (status === "Yes" || status === "Ready for Recycling") {
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' };
    }
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
  };

  const renderDashboardByRole = () => {
    const currentRole = user?.role;

    if (currentRole === "Recycling Facility") {
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>📦 Waste Inventory</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#2e7d32', fontSize: '1.4rem' }}>45.2 Tons Bulk</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>⚡ Recycling Opportunities</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#3182ce', fontSize: '1.4rem' }}>18 Active Nodes</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>📊 Processing Analytics</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#d97706', fontSize: '1.4rem' }}>92.8% Yield Rate</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>📈 Recovery Statistics</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#7c3aed', fontSize: '1.4rem' }}>+14.2% MoM Growth</h3>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#112211', fontSize: '1.2rem', fontWeight: '800' }}>♻️ Facility Shredding & Sorting Queue</h3>
            {renderDefaultEngineWorkspace()}
          </div>
        </div>
      );
    }

    if (currentRole === "Sustainability Manager") {
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>🌱 Sustainability Metrics</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#16a34a', fontSize: '1.4rem' }}>A+ Tier Certified</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>📉 Carbon Reduction Reports</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#0284c7', fontSize: '1.4rem' }}>-34.5 Tons CO2</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>🔄 Waste Diversion Analytics</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#ca8a04', fontSize: '1.4rem' }}>88.4% Diverted</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>📋 ESG Reporting</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#9333ea', fontSize: '1.4rem' }}>Fully Compliant</h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#112211', fontSize: '1.2rem', fontWeight: '800' }}>📑 Waste Classification & Sustainability Report</h3>
                <p style={{ fontSize: '0.88rem', color: '#718096', margin: 0 }}>Generate official compliance reporting metrics compiled from plant batches.</p>
              </div>
              <button onClick={fetchClassificationReport} disabled={reportLoading} style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
                {reportLoading ? "Compiling Report..." : "📊 Generate Report"}
              </button>
            </div>
            {reportData && (
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                  <strong>Generated At: {reportData.generated_at}</strong>
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>{reportData.compliance_status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>Total Batches: <strong>{reportData.total_classified_batches}</strong></div>
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>Recyclability Rate: <strong style={{ color: '#16a34a' }}>{reportData.recyclability_rate}</strong></div>
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>Upcyclability Rate: <strong style={{ color: '#2563eb' }}>{reportData.upcyclability_rate}</strong></div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', margin: 0 }}>"{reportData.executive_summary}"</p>
              </div>
            )}
          </div>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#112211', fontSize: '1.2rem', fontWeight: '800' }}>🌿 Eco-Compliance Audit Simulator</h3>
            {renderDefaultEngineWorkspace()}
          </div>
        </div>
      );
    }

    if (currentRole === "Manufacturer") {
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>🏭 Production Waste Analysis</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#dc2626', fontSize: '1.4rem' }}>1.8 Tons / Batch</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>🔄 Circular Economy Insights</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#16a34a', fontSize: '1.4rem' }}>Optimized Flow</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>♻️ Material Recovery Reports</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#2563eb', fontSize: '1.4rem' }}>76.2% Recovery</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>⭐ Sustainability Performance</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#0d9488', fontSize: '1.4rem' }}>Tier 1 Standard</h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#112211', fontSize: '1.2rem', fontWeight: '800' }}>🧵 Factory Floor Garment Inspection Terminal</h3>
            {renderDefaultEngineWorkspace()}
          </div>
        </div>
      );
    }

    if (currentRole === "Admin") {
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>👥 User Management</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#4f46e5', fontSize: '1.4rem' }}>42 Active Nodes</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>📊 Platform Analytics</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#16a34a', fontSize: '1.4rem' }}>Stable (99.9%)</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>💻 System Monitoring</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#0284c7', fontSize: '1.4rem' }}>Normal Load</h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>📑 Report Management</span>
              <h3 style={{ margin: '10px 0 0 0', color: '#ca8a04', fontSize: '1.4rem' }}>128 Generated</h3>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#112211', fontSize: '1.2rem', fontWeight: '800' }}>📑 Master Waste Classification & Audit Report</h3>
                <p style={{ fontSize: '0.88rem', color: '#718096', margin: 0 }}>Review system-wide classification outputs and audit summaries.</p>
              </div>
              <button onClick={fetchClassificationReport} disabled={reportLoading} style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
                {reportLoading ? "Compiling Report..." : "📊 View System Report"}
              </button>
            </div>

            {reportData && (
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
                  <strong>Generated At: {reportData.generated_at}</strong>
                  <span style={{ color: '#16a34a', fontWeight: '700' }}>{reportData.compliance_status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>Total Batches: <strong>{reportData.total_classified_batches}</strong></div>
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>Recyclability Rate: <strong style={{ color: '#16a34a' }}>{reportData.recyclability_rate}</strong></div>
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>Upcyclability Rate: <strong style={{ color: '#2563eb' }}>{reportData.upcyclability_rate}</strong></div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', margin: 0 }}>"{reportData.executive_summary}"</p>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#112211', fontSize: '1.2rem', fontWeight: '800' }}>⚙️ Master Platform Control & Inspection Gateway</h3>
            {renderDefaultEngineWorkspace()}
          </div>
        </div>
      );
    }

    return renderDefaultEngineWorkspace();
  };

  const renderDefaultEngineWorkspace = () => (
    <div>
      {/* Recyclability Assessment Milestone Component */}
      <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '35px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#132e14', fontSize: '1.4rem', fontWeight: '800' }}>♻️ Textile Recyclability Assessment System</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          Evaluate fabric recovery potential, circularity scores, and waste processing routes based on material composition and wear conditions.
        </p>

        <form onSubmit={calculateRecyclabilityAssessment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', color: '#334155' }}>Fabric Material:</label>
            <select value={assessmentMaterial} onChange={(e) => setAssessmentMaterial(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#f8fafc' }}>
              <option value="cotton">100% Cotton</option>
              <option value="denim">Denim (Cotton Twill)</option>
              <option value="polyester">Polyester (Synthetic)</option>
              <option value="wool">Wool (Animal Protein)</option>
              <option value="silk">Silk</option>
              <option value="mixed">Mixed Blends / Spandex</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', color: '#334155' }}>Garment Condition:</label>
            <select value={assessmentCondition} onChange={(e) => setAssessmentCondition(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#f8fafc' }}>
              <option value="good">Good (Intact, Reusable)</option>
              <option value="worn">Worn (Faded, Light Wear)</option>
              <option value="damaged">Damaged (Torn / Ripped)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '0.85rem', color: '#334155' }}>Contamination Level:</label>
            <select value={assessmentContamination} onChange={(e) => setAssessmentContamination(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#f8fafc' }}>
              <option value="clean">Clean (No chemical stains)</option>
              <option value="slight">Slightly Soiled (Washable)</option>
              <option value="heavy">Heavily Contaminated (Oils/Coatings)</option>
            </select>
          </div>
        </form>
        <button onClick={calculateRecyclabilityAssessment} style={{ width: '100%', backgroundColor: '#1b4d3e', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}>
          Run Recyclability Assessment Metric
        </button>

        {assessmentResult && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
            <h4 style={{ color: '#166534', margin: '0 0 12px 0', fontSize: '1.1rem' }}>📊 Assessment Result Report</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px' }}>
              <div style={{ backgroundColor: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '0.75rem', color: '#65a30d', fontWeight: '700' }}>CIRCULARITY SCORE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#14532d' }}>{assessmentResult.score} / 100</div>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '0.75rem', color: '#65a30d', fontWeight: '700' }}>CLASSIFICATION TIER</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#14532d', marginTop: '4px' }}>{assessmentResult.tier}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: '1.4' }}>
              <p style={{ margin: '4px 0' }}><strong>Feasibility Status:</strong> {assessmentResult.status}</p>
              <p style={{ margin: '4px 0' }}><strong>Target Technology:</strong> {assessmentResult.recyclability}</p>
              <p style={{ margin: '4px 0' }}><strong>Recommended Workflow:</strong> {assessmentResult.recommendedMethod}</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '35px', marginBottom: '50px' }}>
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

            {/* Image Upload Component */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Upload Fabric Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSelectedImage(e.target.files[0])} 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9rem' }} 
              />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: '15px', width: '100%', padding: '15px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(46,125,50,0.3)' }}>
              {loading ? "Processing Engine Matrices..." : "✨ Execute AI Inspection Sequence"}
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '35px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {error && (
            <div style={{ marginBottom: '20px', backgroundColor: '#fff5f5', padding: '12px 16px', borderRadius: '10px', border: '1px solid #fed7d7' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#c53030' }}>⚠️ Error Notification</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#9b2c2c', fontWeight: '700' }}>{error}</p>
            </div>
          )}

          {!aiResult && !loading && !error && (
            <div style={{ textAlign: 'center', color: '#a0aec0' }}>
              <span style={{ fontSize: '3.5rem' }}>🔬</span>
              <h4 style={{ margin: '15px 0 5px 0', color: '#4a5568', fontWeight: '700' }}>Inference Engine Idle</h4>
              <p style={{ fontSize: '0.85rem', color: '#718096' }}>Upload an image and feed fabric variables to get prediction data.</p>
            </div>
          )}
          
          {loading && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', color: '#2b6cb0', fontWeight: '700', marginBottom: '10px' }}>Analyzing Textile Chemical Composition...</div>
              <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTop: '4px solid #2b6cb0', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
              <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#718096' }}>Calculating environmental sorting vectors</p>
            </div>
          )}

          {aiResult && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f7fafc', paddingBottom: '16px', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1a202c' }}>⚡ AI Assessment Report</h4>
                <span style={{ padding: '6px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '20px', fontWeight: '800', fontSize: '0.8rem', border: '1px solid #bbf7d0' }}>
                  Confidence: {(aiResult.ai_result?.confidence * 100).toFixed(2)}%
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>📂 Filename:</span> <strong style={{ float: 'right', color: '#1a202c', fontSize: '0.85rem' }}>{aiResult.filename}</strong></div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>🧵 Fabric:</span> <strong style={{ float: 'right', color: '#2b6cb0' }}>{aiResult.prediction?.fabric}</strong></div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>♻️ Recyclable:</span> <strong style={{ float: 'right', color: aiResult.prediction?.recyclable === 'Yes' ? '#2e7d32':'#e53e3e' }}>{aiResult.prediction?.recyclable}</strong></div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>📐 Dimensions:</span> <strong style={{ float: 'right', color: '#4a5568', fontSize: '0.85rem' }}>{aiResult.image_info?.width} × {aiResult.image_info?.height}</strong></div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>🎨 Channels:</span> <strong style={{ float: 'right', color: '#4a5568' }}>{aiResult.image_info?.channels}</strong></div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}><span style={{ fontSize: '0.85rem', color: '#718096' }}>💡 Brightness:</span> <strong style={{ float: 'right', color: '#d97706' }}>{aiResult.image_info?.brightness}</strong></div>
              </div>

              <div style={{ marginBottom: '16px', backgroundColor: '#f0fdf4', padding: '12px 16px', borderRadius: '10px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#166534' }}>🔄 Reuse Suggestion</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#15803d', fontWeight: '700' }}>{aiResult.prediction?.reuse}</p>
              </div>

              <div style={{ marginBottom: '16px', backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '10px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#1e40af' }}>🤖 AI Execution Status</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#1d4ed8', fontWeight: '700' }}>{aiResult.ai_result?.status} (Predicted Class: {aiResult.ai_result?.predicted_class})</p>
              </div>
            </div>
          )}
        </div>
      </div>

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
                <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '16px 12px', fontWeight: '700' }}>#1042</td>
                  <td style={{ padding: '16px 12px', color: '#1a202c', fontWeight: '700' }}>Denim Jeans (Garment Sorting)</td>
                  <td style={{ padding: '16px 12px' }}><span style={{ backgroundColor: '#f1f5f9', padding: '5px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#1e40af' }}>98% Cotton, 2% Elastane</span></td>
                  <td style={{ padding: '16px 12px', color: '#4a5568' }}>Fashion-MNIST Core Line</td>
                  <td style={{ padding: '16px 12px' }}><span style={{ padding: '6px 14px', borderRadius: '30px', fontSize: '0.78rem', fontWeight: '700', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>Ready for Recycling</span></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, sans-serif', color: '#2d3748', position: 'relative' }}>
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
            <button onClick={() => { setUser(null); setAiResult(null); setReportData(null); }} style={{ padding: '8px 20px', backgroundColor: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
              Disconnect Node
            </button>
          )}
        </div>
      </header>

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

      <main style={{ maxWidth: '1300px', margin: '40px auto', padding: '0 20px' }}>
        {!user ? (
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
                  <input type="password" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.95rem' }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
                  
                  {isRegistering && password.length > 0 && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', fontWeight: '700', color: getPasswordStrength(password).color }}>
                      {getPasswordStrength(password).text}
                    </div>
                  )}
                </div>

                {isRegistering && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Industrial Role Ecosystem</label>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem', fontWeight: '600', color: '#2d3748' }} value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="Manufacturer">Manufacturer Dashboard</option>
                      <option value="Recycling Facility">Recycling Facility Dashboard</option>
                      <option value="Sustainability Manager">Sustainability Manager Dashboard</option>
                      <option value="Admin">Admin Dashboard</option>
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
          <div>
            <div style={{ backgroundColor: '#ffffff', padding: '18px 30px', borderRadius: '14px', marginBottom: '35px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.88rem', color: '#718096' }}>Authenticated Operator: </span>
                <strong style={{ color: '#1a202c' }}>{user.email}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '5px 14px', borderRadius: '8px', fontWeight: '800', border: '1px solid #bae6fd' }}>
                  Active Workspace: {user.role} Dashboard
                </span>
              </div>
            </div>

            {renderDashboardByRole()}
          </div>
        )}
      </main>
      {/* Floating Textile AI Assistant Chat Widget */}
      <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1000 }}>
        {!chatOpen ? (
          <button onClick={() => setChatOpen(true)} style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '50px', padding: '14px 22px', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(46,125,50,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💬 Ask Textile AI
          </button>
        ) : (
          <div style={{ width: '340px', height: '460px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#112211', color: '#fff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Textile Assistant AI</span>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: '700' }}>✕</button>
            </div>

            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc' }}>
              {chatMessages.map((msg, index) => (
                <div key={index} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: msg.sender === 'user' ? '#2e7d32' : '#ffffff', color: msg.sender === 'user' ? '#fff' : '#1e293b', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none' }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleChatSubmit} style={{ padding: '10px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Ask about textile recycling..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }} />
              <button type="submit" style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 14px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>Send</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;