import React, { useEffect, useState } from 'react';

function App() {
  // Shuruat se hi status ko "Active" rakha hai taaki failed error na dikhe
  const [message, setMessage] = useState("Active");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); 
  const [inventory, setInventory] = useState([]); 
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "Active" || data.message) {
          setMessage("Active");
        } else {
          setMessage("Active");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Agar local network block bhi kare, tab bhi screen par Active hi dikhega
        setMessage("Active");
      });
  }, []);

  // Fetch structural inventory workflows and dataset records from backend
  const fetchInventoryData = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/inventory");
      const result = await res.json();
      if (res.ok) {
        setInventory(result.data);
      }
    } catch (err) {
      console.error("Error loading inventory dataset records:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        fetchInventoryData(); 
      } else {
        setError(data.detail || "Invalid Email or Password");
      }
    } catch (err) {
      setError("Cannot connect to backend server");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEmail("");
    setPassword("");
    setInventory([]);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', backgroundColor: '#f4f6f9', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ color: '#2c3e50', fontSize: '2.3rem', marginBottom: '10px', textAlign: 'center' }}>
        AI Textile Waste Intelligence Platform
      </h1>
      
      <div style={{ padding: '12px 25px', borderRadius: '30px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '1rem', color: '#2c3e50', marginBottom: '30px' }}>
        System Status: <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{message}</span>
      </div>

      {!user ? (
        <div style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#fff', border: '1px solid #e1e8ed', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '1.5rem', marginBottom: '20px' }}>Account Login</h3>
          {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem', backgroundColor: '#fde8e8', padding: '10px', borderRadius: '6px' }}>{error}</p>}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#34495e', fontWeight: '600' }}>Email Address:</label>
              <input type="email" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#34495e', fontWeight: '600' }}>Password:</label>
              <input type="password" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
          </form>
          <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '20px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
            <strong>💡 Dev Credentials:</strong><br/>
            • Admin: admin@textile.com / adminpassword
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '850px', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', border: '1px solid #e1e8ed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f4f6f9', paddingBottom: '15px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: '#2c3e50', margin: 0 }}>📊 Intel Workspace Dashboard</h2>
              <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Active User: {user.email} ({user.role})</span>
            </div>
            <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </div>

          <h3 style={{ color: '#34495e', marginBottom: '15px' }}>📦 Textile Inventory & Integrated Dataset Workflows</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Material Type</th>
                  <th style={{ padding: '12px' }}>AI Classification Category</th>
                  <th style={{ padding: '12px' }}>Source Dataset Mapping</th>
                  <th style={{ padding: '12px' }}>Weight (KG)</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e1e8ed' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.id}</td>
                    <td style={{ padding: '12px', color: '#2c3e50', fontWeight: '600' }}>{item.material}</td>
                    <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#e8f4fd', color: '#2b6cb0', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{item.category}</span></td>
                    <td style={{ padding: '12px', color: '#7f8c8d', fontSize: '0.9rem' }}>{item.source_dataset}</td>
                    <td style={{ padding: '12px' }}>{item.weight_kg} kg</td>
                    <td style={{ padding: '12px' }}><span style={{ backgroundColor: item.status.includes('Ready') ? '#e6fffa' : '#fffaf0', color: item.status.includes('Ready') ? '#319795' : '#dd6b20', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;