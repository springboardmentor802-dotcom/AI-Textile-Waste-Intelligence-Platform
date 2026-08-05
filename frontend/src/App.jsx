import { useState, useEffect } from "react";
import PredictionForm from "./components/PredictionForm";
import CircularityCalculator from "./components/CircularityCalculator";

function App() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [role, setRole] = useState("Administrator");
  const [batchId, setBatchId] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [source, setSource] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [inventoryData, setInventoryData] = useState([]);

  const registerUser = async () => {
    const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
        role: role
      })
    });

    const data = await response.json();
    alert(data.message);
  };

  const loginUser = async () => {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword
      })
    });

    const data = await response.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    alert(data.message);
  };

  const addInventory = async () => {
    const response = await fetch("http://127.0.0.1:5000/add_inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch_id: batchId,
        fabric_type: fabricType,
        source: source,
        quantity: quantity,
        color: color,
        condition: condition,
        collection_date: collectionDate
      })
    });

    const data = await response.json();
    alert(data.message);
    fetchInventory();
  };

  const fetchInventory = async () => {
    const response = await fetch("http://127.0.0.1:5000/inventory");
    const data = await response.json();
    setInventoryData(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const totalRecords = inventoryData.length;
  const totalQuantity = inventoryData.reduce((sum, item) => sum + Number(item[4]), 0);
  const uniqueFabricTypes = new Set(inventoryData.map((item) => item[2])).size;

  const deleteInventory = async (id) => {
    const response = await fetch(`http://127.0.0.1:5000/delete_inventory/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();
    alert(data.message);
    fetchInventory();
  };

  const cardStyle = {
    background: "linear-gradient(135deg, rgba(16, 24, 40, 0.95), rgba(8, 15, 28, 0.95))",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.22)",
    backdropFilter: "blur(10px)"
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #0f172a, #020617 70%)", color: "#f8fafc", padding: "24px" }}>
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <section style={{ ...cardStyle, padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div style={{ maxWidth: "720px" }}>
              <p style={{ letterSpacing: "0.3em", textTransform: "uppercase", color: "#7dd3fc", fontSize: "12px", marginBottom: "8px" }}>AI Textile Waste Intelligence Platform</p>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 46px)", margin: "0 0 12px", lineHeight: 1.15 }}>Powering sustainable textile decisions with intelligent foresight.</h1>
              <p style={{ fontSize: "16px", color: "#cbd5e1", lineHeight: 1.7 }}>
                Predict fabric quality, receive circularity guidance, and monitor sustainability impact in one elegant experience.
              </p>
            </div>
            <div style={{ padding: "16px 20px", borderRadius: "16px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)", minWidth: "220px" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.28em", color: "#86efac" }}>Live status</div>
              <div style={{ fontSize: "24px", fontWeight: 700, marginTop: "6px" }}>System online</div>
              <div style={{ fontSize: "13px", color: "#dcfce7", marginTop: "4px" }}>Ready for demo and stakeholder review</div>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[{ label: "Total Records", value: totalRecords, accent: "#38bdf8" }, { label: "Total Quantity", value: totalQuantity, accent: "#f59e0b" }, { label: "Fabric Types", value: uniqueFabricTypes, accent: "#34d399" }].map((item) => (
            <div key={item.label} style={{ ...cardStyle, padding: "18px" }}>
              <div style={{ color: "#94a3b8", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.24em" }}>{item.label}</div>
              <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px", color: item.accent }}>{item.value}</div>
            </div>
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          <div style={{ ...cardStyle }}>
            <h3 style={{ marginTop: 0, marginBottom: "14px" }}>Registration</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <input style={inputStyle} type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Administrator</option>
                <option>Manufacturer</option>
                <option>Recycling Operator</option>
              </select>
              <button style={buttonStyle} onClick={registerUser}>Register</button>
            </div>
          </div>

          <div style={{ ...cardStyle }}>
            <h3 style={{ marginTop: 0, marginBottom: "14px" }}>Login</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <input style={inputStyle} type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <button style={buttonStyle} onClick={loginUser}>Login</button>
            </div>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: "24px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "14px" }}>Inventory Capture</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            <input style={inputStyle} type="text" placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Fabric Type" value={fabricType} onChange={(e) => setFabricType(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} />
            <input style={inputStyle} type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} />
            <input style={inputStyle} type="date" value={collectionDate} onChange={(e) => setCollectionDate(e.target.value)} />
            <button style={buttonStyle} onClick={addInventory}>Add Inventory</button>
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <h3 style={{ margin: 0 }}>Inventory Records</h3>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>Updated from the live backend</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>ID</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Batch ID</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Fabric Type</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Source</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Quantity</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Color</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Condition</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Collection Date</th>
                  <th style={{ padding: "12px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((item) => (
                  <tr key={item[0]} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 10px" }}>{item[0]}</td>
                    <td style={{ padding: "12px 10px" }}>{item[1]}</td>
                    <td style={{ padding: "12px 10px" }}>{item[2]}</td>
                    <td style={{ padding: "12px 10px" }}>{item[3]}</td>
                    <td style={{ padding: "12px 10px" }}>{item[4]}</td>
                    <td style={{ padding: "12px 10px" }}>{item[5]}</td>
                    <td style={{ padding: "12px 10px" }}>{item[6]}</td>
                    <td style={{ padding: "12px 10px" }}>{item[7]}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <button
                        style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer" }}
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this inventory record?")) {
                            deleteInventory(item[0]);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <PredictionForm />
        <CircularityCalculator />
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  background: "rgba(15, 23, 42, 0.7)",
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

export default App;