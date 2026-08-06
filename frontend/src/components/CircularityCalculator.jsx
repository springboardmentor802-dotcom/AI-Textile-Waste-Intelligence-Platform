import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function CircularityCalculator() {
  const [formData, setFormData] = useState({
    fabric_type: "",
    weight: "",
    production_method: "",
    finish_type: "",
    defect_count: "",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCalculate = async () => {
    console.log("Sending data to backend...");
    try {
      const response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fabric_quality: "High",
          fabric_type: formData.fabric_type,
          quantity: formData.weight,
          production_method: formData.production_method,
          finish_type: formData.finish_type,
          defect_count: formData.defect_count,
        }),
      });
      const data = await response.json();
      console.log("Backend Response:", data);
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  const sustainabilityScore = Number(result?.sustainability_score) || 0;
  const circularityScore = Number(result?.circularity_score) || 0;
  const co2Saved = Number(result?.co2_saved) || 0;
  const waterSaved = Number(result?.water_saved) || 0;
  const energySaved = Number(result?.energy_saved) || 0;

  const chartData = {
    labels: [
      "Sustainability Score",
      "Circularity Score",
      "CO₂ Saved",
      "Water Saved",
      "Energy Saved",
    ],
    datasets: [
      {
        label: "Recommendation Metrics",
        data: [sustainabilityScore, circularityScore, co2Saved, waterSaved, energySaved],
        backgroundColor: [
          "rgba(52, 211, 153, 0.75)",
          "rgba(56, 189, 248, 0.75)",
          "rgba(245, 158, 11, 0.75)",
          "rgba(96, 165, 250, 0.75)",
          "rgba(167, 139, 250, 0.75)",
        ],
        borderColor: [
          "rgba(52, 211, 153, 1)",
          "rgba(56, 189, 248, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(96, 165, 250, 1)",
          "rgba(167, 139, 250, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Environmental Impact Analysis",
        color: "#f8fafc",
        font: {
          size: 18,
          weight: "600",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.06)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "rgba(255,255,255,0.06)",
        },
      },
    },
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "rgba(15, 23, 42, 0.75)",
    color: "#f8fafc",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "12px 16px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer"
  };

  return (
    <section style={{ marginTop: "24px", borderRadius: "24px", padding: "24px", background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 45px rgba(0, 0, 0, 0.28)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <p style={{ letterSpacing: "0.3em", textTransform: "uppercase", color: "#7dd3fc", fontSize: "12px", margin: 0 }}>Circularity Insights</p>
          <h2 style={{ margin: "6px 0 0", fontSize: "28px", color: "#f8fafc" }}>Circularity Calculator</h2>
          <p style={{ marginTop: "12px", color: "#cbd5e1", lineHeight: 1.7 }}>
            Estimate sustainability impact in a modern dashboard layout without changing backend behavior.
          </p>
        </div>
        <div style={{ padding: "12px 16px", borderRadius: "16px", background: "rgba(15, 23, 42, 0.88)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", minWidth: "180px" }}>
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.24em", color: "#94a3b8" }}>Status</div>
          <div style={{ marginTop: "8px", fontWeight: 700, color: "#86efac" }}>Ready to calculate</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#e2e8f0", fontSize: "14px" }}>
          Fabric Type
          <select name="fabric_type" value={formData.fabric_type} onChange={handleChange} style={inputStyle}>
            <option value="">Select</option>
            <option value="cotton">Cotton</option>
            <option value="linen">Linen</option>
            <option value="silk">Silk</option>
            <option value="wool">Wool</option>
            <option value="polyester">Polyester</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#e2e8f0", fontSize: "14px" }}>
          Weight (kg)
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} style={inputStyle} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#e2e8f0", fontSize: "14px" }}>
          Production Method
          <select name="production_method" value={formData.production_method} onChange={handleChange} style={inputStyle}>
            <option value="">Select</option>
            <option value="handloom">Handloom</option>
            <option value="powerloom">Powerloom</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#e2e8f0", fontSize: "14px" }}>
          Finish Type
          <select name="finish_type" value={formData.finish_type} onChange={handleChange} style={inputStyle}>
            <option value="">Select</option>
            <option value="raw">Raw</option>
            <option value="dyed">Dyed</option>
            <option value="printed">Printed</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#e2e8f0", fontSize: "14px" }}>
          Defect Count
          <input type="number" name="defect_count" value={formData.defect_count} onChange={handleChange} style={inputStyle} />
        </label>
      </div>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button type="button" onClick={handleCalculate} style={{ ...buttonStyle, minWidth: "220px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          Calculate Sustainability
        </button>
      </div>

      {result ? (
        <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
          <div className="result-banner">
            <div>
              <div className="recommendation-title">Recommendation</div>
              <h3 className="recommendation-heading">
                {result.recommendation || "Circularity insight generated"}
              </h3>
              <p className="recommendation-copy">
                Use this dashboard to compare sustainability and circularity outcomes with real-time CO₂, water, and energy impact metrics.
              </p>
            </div>
            <span className="banner-badge">Sustainability Ready</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            {[
              { label: "Sustainability Score", value: result.sustainability_score, icon: "♻️", color: "#34d399" },
              { label: "Circularity Score", value: result.circularity_score, icon: "🔁", color: "#38bdf8" },
              { label: "CO₂ Saved", value: result.co2_saved, icon: "🌿", color: "#f59e0b" },
              { label: "Water Saved", value: result.water_saved, icon: "💧", color: "#60a5fa" },
              { label: "Energy Saved", value: result.energy_saved, icon: "⚡", color: "#a78bfa" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.22em", color: "#94a3b8" }}>{item.label}</div>
                <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "6px", color: item.color }}>{item.icon} {item.value}</div>
              </div>
            ))}
          </div>

          <div className="progress-row">
            <div className="progress-card">
              <div className="progress-label">
                <span>Sustainability Score</span>
                <strong>{sustainabilityScore}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill--sustainability" style={{ width: `${sustainabilityScore}%` }} />
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-label">
                <span>Circularity Score</span>
                <strong>{circularityScore}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-fill--circularity" style={{ width: `${circularityScore}%` }} />
              </div>
            </div>
          </div>

          <div style={{ minHeight: "320px", padding: "18px", borderRadius: "18px", background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      ) : (
        <div className="empty-state">
          Enter the fabric details above and click Calculate Sustainability to reveal the recommendation dashboard.
        </div>
      )}
    </section>
  );
}

export default CircularityCalculator;