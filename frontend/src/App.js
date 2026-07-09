import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("Loading backend data...");

  useEffect(() => {
    // Yeh code hamare Python backend se data lekar aata hai
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("Failed to connect to backend!");
      });
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      flexDirection: 'column', 
      backgroundColor: '#f4f6f9', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#2c3e50', fontSize: '2.5rem', marginBottom: '20px' }}>
        AI Textile Waste Intelligence Platform
      </h1>
      <div style={{ 
        padding: '20px', 
        borderRadius: '10px', 
        backgroundColor: '#fff', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        fontSize: '1.2rem', 
        color: '#2c3e50', 
        fontWeight: 'normal' 
      }}>
        System Status: <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{message}</span>
      </div>
    </div>
  );
}

export default App;