import { useState } from "react";

function App() {
  const [message, setMessage] = useState('');

  async function callBackend() {
    const response = await fetch('http://localhost:8000/');
    const data = await response.json();
    setMessage(data.message);
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Textile Waste Intelligence Platform</h1>
      <button onClick={callBackend}>Call Backend</button>
      {message && <p>Backend says: {message}</p>}
    </div>
  );
}

export default App;