import { useState } from "react";

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

  return (
    <div className="prediction-card" style={{ marginTop: "40px" }}>
      <h2>♻️ Circularity Calculator</h2>
      <p>
        Calculate sustainability metrics without uploading an image.
      </p>

      <div className="prediction-grid">

        <div>
          <label>Fabric Type</label>
          <select
            name="fabric_type"
            value={formData.fabric_type}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="cotton">Cotton</option>
            <option value="linen">Linen</option>
            <option value="silk">Silk</option>
            <option value="wool">Wool</option>
            <option value="polyester">Polyester</option>
          </select>
        </div>

        <div>
          <label>Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Production Method</label>
          <select
            name="production_method"
            value={formData.production_method}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="handloom">Handloom</option>
            <option value="powerloom">Powerloom</option>
          </select>
        </div>

        <div>
          <label>Finish Type</label>
          <select
            name="finish_type"
            value={formData.finish_type}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="raw">Raw</option>
            <option value="dyed">Dyed</option>
            <option value="printed">Printed</option>
          </select>
        </div>

        <div>
          <label>Defect Count</label>
          <input
            type="number"
            name="defect_count"
            value={formData.defect_count}
            onChange={handleChange}
          />
        </div>

      </div>

      <button 
        style={{ marginTop: "20px" }}
        onClick={handleCalculate}
      >
        Calculate Sustainability
      </button>
      {result && (
         <div style={{ marginTop: "20px",padding: "20px",backgroundColor: "#1e293b",border: "2px solid #22c55e",borderRadius: "10px", color: "white" }}>
           <h3>Recommendation Result</h3>
            <p><strong>Recommendation:</strong> {result.recommendation}</p>
            <p><strong>Sustainability Score:</strong> {result.sustainability_score}</p>
            <p><strong>Circularity Score:</strong> {result.circularity_score}</p>
            <p><strong>CO₂ Saved:</strong> {result.co2_saved}</p>
            <p><strong>Water Saved:</strong> {result.water_saved}</p>
            <p><strong>Energy Saved:</strong> {result.energy_saved}</p>
          </div>
        )}
    </div>
  );
}

export default CircularityCalculator;