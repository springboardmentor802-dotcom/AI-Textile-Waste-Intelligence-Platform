function App() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Textile Waste Intelligence Platform</h1>
      <h2>Milestone 1 - Authentication & Inventory Management</h2>

      <hr />

      <h3>Login Module</h3>
      <input type="email" placeholder="Email" /><br /><br />
      <input type="password" placeholder="Password" /><br /><br />
      <button>Login</button>

      <hr />

      <h3>Registration Module</h3>
      <input type="text" placeholder="Full Name" /><br /><br />
      <input type="email" placeholder="Email" /><br /><br />
      <input type="password" placeholder="Password" /><br /><br />

      <select>
        <option>Administrator</option>
        <option>Manufacturer</option>
        <option>Recycling Operator</option>
      </select>

      <br /><br />
      <button>Register</button>

      <hr />

      <h3>Waste Inventory Management</h3>

      <input type="text" placeholder="Waste Batch ID" /><br /><br />
      <input type="text" placeholder="Fabric Type" /><br /><br />
      <input type="text" placeholder="Source" /><br /><br />
      <input type="number" placeholder="Quantity" /><br /><br />
      <input type="text" placeholder="Color" /><br /><br />
      <input type="text" placeholder="Condition" /><br /><br />
      <input type="date" /><br /><br />

      <button>Add Inventory</button>
    </div>
  );
}

export default App;