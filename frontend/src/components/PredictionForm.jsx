import { useState } from "react";

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
  width: "100%",
  boxSizing: "border-box"
};

const labelStyle = {
  fontWeight: "bold",
  color: "#ffffff",
  marginBottom: "5px",
  display: "block"
};

function PredictionForm() {
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
    fabric_type: "",
    weave_type: "",
    finish_type: "",
    production_method: "",
    batch_id: "",
    roll_number: "",
    inspection_time_minutes: "",
    warehouse_id: "",
    operator_name: "",
    inspection_shift: "",
    machine_temperature: "",
    humidity_level: "",
    inspection_notes: ""
  });

  const [predictionResult, setPredictionResult] = useState("");

  const handleChange = (e) => {
    setPredictionData({
      ...predictionData,
      [e.target.name]: e.target.value
    });
  };

  const predictFabricQuality = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(predictionData)
      });

      const data = await response.json();

      if (data.predicted_fabric_quality) {
        setPredictionResult(data.predicted_fabric_quality);
      } else {
        setPredictionResult(data.error || "Prediction Failed");
      }
    } catch (error) {
      setPredictionResult("Server Error");
    }
  };

  return (
    <div
      style={{
        marginTop: "40px",
        border: "2px solid white",
        padding: "20px",
        borderRadius: "10px"
      }}
    >
      <h2>AI Fabric Quality Prediction</h2>

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "18px"
  }}
>
        <input type="number" name="thread_count" placeholder="Thread Count" value={predictionData.thread_count} onChange={handleChange}/>
        <input type="number" name="gsm" placeholder="GSM" value={predictionData.gsm} onChange={handleChange}/>
        <input type="number" name="tensile_strength" placeholder="Tensile Strength" value={predictionData.tensile_strength} onChange={handleChange}/>
        <input type="number" name="shrinkage_percent" placeholder="Shrinkage %" value={predictionData.shrinkage_percent} onChange={handleChange}/>
        <input type="number" name="color_fastness" placeholder="Color Fastness" value={predictionData.color_fastness} onChange={handleChange}/>
        <input type="number" name="fabric_thickness" placeholder="Fabric Thickness" value={predictionData.fabric_thickness} onChange={handleChange}/>
        <input type="number" name="defect_count" placeholder="Defect Count" value={predictionData.defect_count} onChange={handleChange}/>
        <input type="number" name="elongation_percent" placeholder="Elongation %" value={predictionData.elongation_percent} onChange={handleChange}/>
        <input type="number" name="moisture_absorption" placeholder="Moisture Absorption" value={predictionData.moisture_absorption} onChange={handleChange}/>

        {/* Fabric Type */}
        <select name="fabric_type" value={predictionData.fabric_type} onChange={handleChange}>
          <option value="">Select Fabric Type</option>
          <option value="cotton">cotton</option>
          <option value="linen">linen</option>
          <option value="polyester">polyester</option>
          <option value="silk">silk</option>
          <option value="wool">wool</option>
        </select>

        {/* Weave Type */}
        <select name="weave_type" value={predictionData.weave_type} onChange={handleChange}>
          <option value="">Select Weave Type</option>
          <option value="plain">plain</option>
          <option value="twill">twill</option>
          <option value="satin">satin</option>
        </select>

        {/* Finish Type */}
        <select name="finish_type" value={predictionData.finish_type} onChange={handleChange}>
          <option value="">Select Finish Type</option>
          <option value="raw">raw</option>
          <option value="dyed">dyed</option>
          <option value="printed">printed</option>
        </select>

        {/* Production Method */}
        <select name="production_method" value={predictionData.production_method} onChange={handleChange}>
          <option value="">Select Production Method</option>
          <option value="handloom">handloom</option>
          <option value="powerloom">powerloom</option>
        </select>

        <input type="number" name="batch_id" placeholder="Batch ID" value={predictionData.batch_id} onChange={handleChange}/>
        <input type="number" name="roll_number" placeholder="Roll Number" value={predictionData.roll_number} onChange={handleChange}/>
        <input type="number" name="inspection_time_minutes" placeholder="Inspection Time (Minutes)" value={predictionData.inspection_time_minutes} onChange={handleChange}/>

        {/* Warehouse */}
        <select name="warehouse_id" value={predictionData.warehouse_id} onChange={handleChange}>
          <option value="">Select Warehouse</option>
          <option value="WH-A">WH-A</option>
          <option value="WH-B">WH-B</option>
          <option value="WH-C">WH-C</option>
        </select>

        {/* Operator */}
        <select name="operator_name" value={predictionData.operator_name} onChange={handleChange}>
          <option value="">Select Operator</option>
          <option value="Suresh">Suresh</option>
          <option value="Ramesh">Ramesh</option>
          <option value="Priya">Priya</option>
          <option value="John">John</option>
          <option value="Anita">Anita</option>
        </select>

        {/* Shift */}
        <select name="inspection_shift" value={predictionData.inspection_shift} onChange={handleChange}>
          <option value="">Select Shift</option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
          <option value="Night">Night</option>
        </select>

        <input type="number" name="machine_temperature" placeholder="Machine Temperature" value={predictionData.machine_temperature} onChange={handleChange}/>
        <input type="number" name="humidity_level" placeholder="Humidity Level" value={predictionData.humidity_level} onChange={handleChange}/>

        {/* Inspection Notes */}
        <select name="inspection_notes" value={predictionData.inspection_notes} onChange={handleChange}>
          <option value="">Select Inspection Note</option>
          <option value="Looks fine">Looks fine</option>
          <option value="Minor issue">Minor issue</option>
          <option value="Approved">Approved</option>
          <option value="Recheck">Recheck</option>
          <option value="OK">OK</option>
        </select>
      </div>

      <br />

      <button onClick={predictFabricQuality}>
        Predict Fabric Quality
      </button>

      <br /><br />

      <h3>Prediction Result</h3>

      <h2>{predictionResult}</h2>
    </div>
  );
}

export default PredictionForm;