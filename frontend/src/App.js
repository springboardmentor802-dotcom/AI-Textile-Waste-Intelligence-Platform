import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("Loading backend data...");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // Logged in user info ki state
  const [error, setError] = useState("");

  useEffect(() => {
    // Yeh code hamare Python backend se data lekar aata hai
    fetch("http://localhost:8000/")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("Failed to connect to backend!");
      });
  }, []);

  // Login submit karne ka function
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
        setUser(data); // User login data (email aur role) save ho jayega
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
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      flexDirection: 'column', 
      backgroundColor: '#f4f6f9', 
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ color: '#2c3e50', fontSize: '2.3rem', marginBottom: '10px', textAlign: 'center' }}>
        AI Textile Waste Intelligence Platform
      </h1>
      
      {/* SYSTEM STATUS BOX */}
      <div style={{ 
        padding: '12px 25px', 
        borderRadius: '30px', 
        backgroundColor: '#fff', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
        fontSize: '1rem', 
        color: '#2c3e50',
        marginBottom: '30px'
      }}>
        System Status: <span style={{ color: message.includes("Failed") ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>{message}</span>
      </div>

      {/* AGAR USER LOGGED IN NAHI HAI TOH LOGIN FORM DIKHAO */}
      {!user ? (
        <div style={{ 
          width: '100%',
          maxWidth: '400px', 
          padding: '30px', 
          backgroundColor: '#fff',
          border: '1px solid #e1e8ed', 
          borderRadius: '12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50', fontSize: '1.5rem', marginBottom: '20px' }}>Account Login</h3>
          
          {error && <p style={{ color: '#e74c3c', fontSize: '0.9rem', backgroundColor: '#fde8e8', padding: '10px', borderRadius: '6px' }}>{error}</p>}
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#34495e', fontWeight: '600' }}>Email Address:</label>
              <input 
                type="email" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
                required 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#34495e', fontWeight: '600' }}>Password:</label>
              <input 
                type="password" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Sign In
            </button>
          </form>
          <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '20px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
            <strong>💡 Hint accounts for testing:</strong><br/>
            • Admin: admin@textile.com / adminpassword<br/>
            • Manager: manager@textile.com / managerpassword
          </div>
        </div>
      ) : (
        /* AGAR USER SUCCESSFUL LOGIN HO GAYA HAI TOH DASHBOARD DIKHAO */
        <div style={{ width: '100%', maxWidth: '600px', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', border: '1px solid #27ae60' }}>
          <h2 style={{ color: '#27ae60', marginTop: 0 }}>🎉 Login Successful!</h2>
          <p style={{ fontSize: '1.1rem' }}><strong>Logged in as:</strong> {user.email}</p>
          <p style={{ fontSize: '1.1rem' }}><strong>Your Role:</strong> <span style={{ padding: '4px 10px', backgroundColor: '#34495e', color: '#fff', borderRadius: '20px', fontSize: '0.9rem' }}>{user.role}</span></p>
          
          <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '5px solid #2980b9' }}>
            <h4 style={{ marginTop: 0, color: '#2980b9' }}>Workspace Section (Role-Based Access)</h4>
            {user.role === "Admin" ? (
              <p style={{ color: '#2c3e50', margin: 0 }}>👑 <strong>Welcome Admin:</strong> You have full control over System Analytics, AI model adjustments, and Workflow Rules config.</p>
            ) : (
              <p style={{ color: '#2c3e50', margin: 0 }}>📦 <strong>Welcome Manager:</strong> You have access to Textile Inventory Entry Logs, Waste categorization lists, and Dataset uploading.</p>
            )}
          </div>

          <button onClick={handleLogout} style={{ marginTop: '25px', padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout Account
          </button>
        </div>
      )}
    </div>
  );
}

export default App;