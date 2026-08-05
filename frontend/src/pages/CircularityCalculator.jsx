import { useState } from "react";

function CircularityCalculator() {
  const defaultCategoricalValues = {
    fabric_type: "cotton",
    production_method: "handloom",
    finish_type: "raw",
  };

  const [form, setForm] = useState({
    fabric_quality: "high",
    quantity: 1,
    gsm: 100,
    defect_count: 0,
    fabric_type: defaultCategoricalValues.fabric_type,
    production_method: defaultCategoricalValues.production_method,
    finish_type: defaultCategoricalValues.finish_type,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const compute = async () => {
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        fabric_quality: form.fabric_quality,
        quantity: Number(form.quantity) || 1,
        gsm: Number(form.gsm) || 100,
        defect_count: Number(form.defect_count) || 0,
        fabric_type: form.fabric_type,
        production_method: form.production_method,
        finish_type: form.finish_type,
      };

      const res = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Server error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginTop: "24px", borderRadius: "20px", padding: "20px", background: "linear-gradient(135deg, rgba(8,10,20,0.95), rgba(2,6,23,0.95))", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div>
          <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#7dd3fc" }}>Tools</div>
          <h3 style={{ margin: "6px 0 0" }}>Circularity Calculator</h3>
        </div>
        <div style={{ color: "#94a3b8" }}>Quickly estimate circularity and sustainability impacts</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
        <label style={labelStyle}>
          <span>Predicted Quality</span>
          <select name="fabric_quality" value={form.fabric_quality} onChange={handleChange} style={inputStyle}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label style={labelStyle}>
          <span>Quantity</span>
          <input name="quantity" type="number" value={form.quantity} onChange={handleChange} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          <span>GSM</span>
          <input name="gsm" type="number" value={form.gsm} onChange={handleChange} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          <span>Defect Count</span>
          <input name="defect_count" type="number" value={form.defect_count} onChange={handleChange} style={inputStyle} />
        </label>

        <label style={labelStyle}>
          <span>Fabric Type</span>
          <select name="fabric_type" value={form.fabric_type} onChange={handleChange} style={inputStyle}>
            <option>cotton</option>
            <option>linen</option>
            <option>polyester</option>
            <option>silk</option>
            <option>wool</option>
          </select>
        </label>

        <label style={labelStyle}>
          <span>Production Method</span>
          <select name="production_method" value={form.production_method} onChange={handleChange} style={inputStyle}>
            <option>handloom</option>
            <option>powerloom</option>
          </select>
        </label>

        <label style={labelStyle}>
          <span>Finish Type</span>
          <select name="finish_type" value={form.finish_type} onChange={handleChange} style={inputStyle}>
            <option>raw</option>
            <option>dyed</option>
            <option>printed</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: "14px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={compute} style={buttonStyle} disabled={loading}>{loading ? 'Calculating...' : 'Calculate'}</button>
        {result && result.error && (
          <div style={{ color: "#fecaca" }}>{result.error}</div>
        )}
      </div>

      {result && !result.error && (
        <div style={{ marginTop: "18px", display: "grid", gap: "16px" }}>
          <div style={{ padding: "18px", borderRadius: "24px", background: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ textTransform: "uppercase", letterSpacing: "0.3em", fontSize: "12px", color: "#7dd3fc" }}>Recommendation</div>
                <h3 style={{ margin: "10px 0 0", fontSize: "22px", color: "#f8fafc" }}>{result.recommendation}</h3>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: "999px", background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", fontWeight: 700, fontSize: "14px" }}>Circularity Calculator</div>
            </div>
            <p style={{ marginTop: "12px", color: "#cbd5e1", lineHeight: 1.7 }}>The engine computes a dynamic circularity profile based on your textile inputs, including material properties, process factors, and defect impact.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
            <MetricCard label="Sustainability Score" value={`${result.sustainability_score}%`} color="#34d399" />
            <MetricCard label="Circularity Score" value={`${result.circularity_score}%`} color="#38bdf8" />
            <MetricCard label="CO₂ Saved" value={`${result.co2_saved}`} color="#f59e0b" />
            <MetricCard label="Water Saved" value={`${result.water_saved}`} color="#60a5fa" />
            <MetricCard label="Energy Saved" value={`${result.energy_saved}`} color="#a78bfa" />
          </div>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div style={{ padding: "16px", borderRadius: "18px", background: "rgba(15, 23, 42, 0.92)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 12px 28px rgba(0,0,0,0.18)", minWidth: "160px" }}>
      <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.22em" }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "10px", color }}>{value}</div>
    </div>
  );
}

const labelStyle = { display: "flex", flexDirection: "column", gap: "6px", color: "#e2e8f0", fontSize: "14px" };

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  background: "rgba(15,23,42,0.65)",
  color: "#f8fafc",
  boxSizing: "border-box"
};

const buttonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #06b6d4, #0ea5a5)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer"
};

export default CircularityCalculator;
