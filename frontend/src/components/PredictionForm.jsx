import { useState } from "react";

function PredictionForm() {
  const defaultCategoricalValues = {
    fabric_type: "cotton",
    weave_type: "plain",
    finish_type: "raw",
    production_method: "handloom",
    warehouse_id: "WH-A",
    operator_name: "Suresh",
    inspection_shift: "Morning",
    inspection_notes: "Looks fine"
  };

  const [predictionData, setPredictionData] = useState({
    thread_count: "",
    gsm: "",
    tensile_strength: "",
    shrinkage_percent: "",
    color_fastness: "",
    fabric_thickness: "",
    defect_count: "",
    elongation_percent: "",
    moisture_absorption: "",
    fabric_type: defaultCategoricalValues.fabric_type,
    weave_type: defaultCategoricalValues.weave_type,
    finish_type: defaultCategoricalValues.finish_type,
    production_method: defaultCategoricalValues.production_method,
    batch_id: "",
    roll_number: "",
    inspection_time_minutes: "",
    warehouse_id: defaultCategoricalValues.warehouse_id,
    operator_name: defaultCategoricalValues.operator_name,
    inspection_shift: defaultCategoricalValues.inspection_shift,
    machine_temperature: "",
    humidity_level: "",
    inspection_notes: defaultCategoricalValues.inspection_notes
  });

  const [predictionResult, setPredictionResult] = useState("");
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const buildPredictionPayload = () => {
    const payload = { ...predictionData };

    Object.entries(defaultCategoricalValues).forEach(([field, fallbackValue]) => {
      if (!payload[field]) {
        payload[field] = fallbackValue;
      }
    });

    const numericFields = [
      "thread_count",
      "gsm",
      "tensile_strength",
      "shrinkage_percent",
      "color_fastness",
      "fabric_thickness",
      "defect_count",
      "elongation_percent",
      "moisture_absorption",
      "batch_id",
      "roll_number",
      "inspection_time_minutes",
      "machine_temperature",
      "humidity_level"
    ];

    numericFields.forEach((field) => {
      const value = payload[field];
      payload[field] = value === "" || value === null || value === undefined ? 0 : Number(value);
    });

    return payload;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPredictionData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const predictFabricQuality = async () => {
    setIsLoading(true);
    setPredictionResult("");
    setRecommendationResult(null);

    try {
      const payload = buildPredictionPayload();

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.predicted_fabric_quality) {
        setPredictionResult(data.error || "Prediction Failed");
        return;
      }

      const predictedQuality = String(data.predicted_fabric_quality);
      setPredictionResult(predictedQuality);

      const recommendResponse = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fabric_quality: predictedQuality
        })
      });

      const recommendData = await recommendResponse.json();

      if (!recommendResponse.ok) {
        setRecommendationResult({ error: recommendData.error || "Recommendation Failed" });
        return;
      }

      setRecommendationResult(recommendData);
    } catch (error) {
      setPredictionResult("Server Error");
      setRecommendationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeStyle = (prediction) => {
    if (!prediction) return { background: "rgba(148, 163, 184, 0.18)", color: "#cbd5e1" };
    if (prediction.toLowerCase() === "high") return { background: "rgba(34, 197, 94, 0.18)", color: "#86efac" };
    if (prediction.toLowerCase() === "medium") return { background: "rgba(249, 115, 22, 0.18)", color: "#fdba74" };
    return { background: "rgba(248, 113, 113, 0.18)", color: "#fda4af" };
  };

  const recommendationMetrics = recommendationResult && !recommendationResult.error
    ? [
        { label: "Sustainability Score", value: recommendationResult.sustainability_score, icon: "♻️", color: "#34d399" },
        { label: "Circularity Score", value: recommendationResult.circularity_score, icon: "🔁", color: "#38bdf8" },
        { label: "CO₂ Saved", value: recommendationResult.co2_saved, icon: "🌿", color: "#f59e0b" },
        { label: "Water Saved", value: recommendationResult.water_saved, icon: "💧", color: "#60a5fa" },
        { label: "Energy Saved", value: recommendationResult.energy_saved, icon: "⚡", color: "#a78bfa" }
      ]
    : [];

  return (
    <section style={{ marginTop: "24px", borderRadius: "24px", padding: "24px", background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 45px rgba(0, 0, 0, 0.28)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <p style={{ letterSpacing: "0.3em", textTransform: "uppercase", color: "#7dd3fc", fontSize: "12px", margin: 0 }}>Prediction Studio</p>
          <h2 style={{ margin: "6px 0 0", fontSize: "28px" }}>AI Fabric Quality Prediction</h2>
        </div>
        <div style={{ ...getBadgeStyle(predictionResult), padding: "10px 14px", borderRadius: "999px", fontWeight: 700 }}>Prediction: {predictionResult || "Awaiting"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
        {[
          { name: "thread_count", label: "Thread Count", type: "number" },
          { name: "gsm", label: "GSM", type: "number" },
          { name: "tensile_strength", label: "Tensile Strength", type: "number" },
          { name: "shrinkage_percent", label: "Shrinkage %", type: "number" },
          { name: "color_fastness", label: "Color Fastness", type: "number" },
          { name: "fabric_thickness", label: "Fabric Thickness", type: "number" },
          { name: "defect_count", label: "Defect Count", type: "number" },
          { name: "elongation_percent", label: "Elongation %", type: "number" },
          { name: "moisture_absorption", label: "Moisture Absorption", type: "number" },
          { name: "fabric_type", label: "Fabric Type", type: "select", options: ["cotton", "linen", "polyester", "silk", "wool"] },
          { name: "weave_type", label: "Weave Type", type: "select", options: ["plain", "twill", "satin"] },
          { name: "finish_type", label: "Finish Type", type: "select", options: ["raw", "dyed", "printed"] },
          { name: "production_method", label: "Production Method", type: "select", options: ["handloom", "powerloom"] },
          { name: "batch_id", label: "Batch ID", type: "number" },
          { name: "roll_number", label: "Roll Number", type: "number" },
          { name: "inspection_time_minutes", label: "Inspection Time (Minutes)", type: "number" },
          { name: "warehouse_id", label: "Warehouse", type: "select", options: ["WH-A", "WH-B", "WH-C"] },
          { name: "operator_name", label: "Operator", type: "select", options: ["Suresh", "Ramesh", "Priya", "John", "Anita"] },
          { name: "inspection_shift", label: "Inspection Shift", type: "select", options: ["Morning", "Evening", "Night"] },
          { name: "machine_temperature", label: "Machine Temperature", type: "number" },
          { name: "humidity_level", label: "Humidity Level", type: "number" },
          { name: "inspection_notes", label: "Inspection Notes", type: "select", options: ["Looks fine", "Minor issue", "Approved", "Recheck", "OK"] }
        ].map((field) => (
          <label key={field.name} style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#e2e8f0", fontSize: "14px" }}>
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select name={field.name} value={predictionData[field.name]} onChange={handleChange} style={inputStyle}>
                <option value="">Select {field.label}</option>
                {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <input type="number" name={field.name} placeholder={field.label} value={predictionData[field.name]} onChange={handleChange} style={inputStyle} />
            )}
          </label>
        ))}
      </div>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={predictFabricQuality} disabled={isLoading} style={{ ...buttonStyle, minWidth: "220px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          {isLoading ? <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : "✨"}
          {isLoading ? "Predicting..." : "Predict Fabric Quality"}
        </button>
        {predictionResult && (
          <div style={{ color: "#cbd5e1", fontSize: "14px" }}>Last prediction: <strong>{predictionResult}</strong></div>
        )}
      </div>

      {isLoading ? null : (
        <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
          {recommendationResult && !recommendationResult.error ? (
            <>
              <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.22)" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#86efac" }}>Recommendation</div>
                <h3 style={{ margin: "8px 0 6px", fontSize: "20px" }}>{recommendationResult.recommendation}</h3>
                <p style={{ margin: 0, color: "#d1fae5" }}>This route supports circular reuse and improved sustainability outcomes.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {recommendationMetrics.map((item) => (
                  <div key={item.label} style={{ padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.22em", color: "#94a3b8" }}>{item.label}</div>
                    <div style={{ fontSize: "22px", fontWeight: 700, marginTop: "6px", color: item.color }}>{item.icon} {item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#e2e8f0" }}>
                    <span>Sustainability Score</span>
                    <strong>{recommendationResult.sustainability_score}%</strong>
                  </div>
                  <div style={{ height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${recommendationResult.sustainability_score}%`, height: "100%", background: "linear-gradient(90deg, #34d399, #22c55e)", borderRadius: "999px" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#e2e8f0" }}>
                    <span>Circularity Score</span>
                    <strong>{recommendationResult.circularity_score}%</strong>
                  </div>
                  <div style={{ height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${recommendationResult.circularity_score}%`, height: "100%", background: "linear-gradient(90deg, #38bdf8, #3b82f6)", borderRadius: "999px" }} />
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {recommendationResult && recommendationResult.error ? (
            <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(248, 113, 113, 0.12)", border: "1px solid rgba(248, 113, 113, 0.24)", color: "#fecaca" }}>{recommendationResult.error}</div>
          ) : null}
          {!recommendationResult && !isLoading ? (
            <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(148, 163, 184, 0.12)", border: "1px solid rgba(148, 163, 184, 0.2)", color: "#cbd5e1" }}>Enter the fabric details above and run the prediction to unlock the recommendation dashboard.</div>
          ) : null}
        </div>
      )}
    </section>
  );
}

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

export default PredictionForm;