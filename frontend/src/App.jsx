import { useState, useEffect } from "react";

function App() {

  // Registration States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Administrator");

  // Inventory States
  const [batchId, setBatchId] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [source, setSource] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  // Register User
  const registerUser = async () => {

    const response = await fetch(
      "http://127.0.0.1:5000/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
          role: role
        })
      }
    );

    const data = await response.json();
    alert(data.message);
  };

  // Add Inventory
  const addInventory = async () => {

    const response = await fetch(
      "http://127.0.0.1:5000/add_inventory",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          batch_id: batchId,
          fabric_type: fabricType,
          source: source,
          quantity: quantity,
          color: color,
          condition: condition,
          collection_date: collectionDate
        })
      }
    );

    const data = await response.json();
    alert(data.message);
    fetchInventory();
  };
  const fetchInventory = async () => {
  const response = await fetch(
    "http://127.0.0.1:5000/inventory"
  );

  const data = await response.json();

  setInventoryData(data);
};

useEffect(() => {
  fetchInventory();
}, []);

const totalRecords = inventoryData.length;

const totalQuantity = inventoryData.reduce(
  (sum, item) => sum + Number(item[4]),
  0
);

const uniqueFabricTypes = new Set(
  inventoryData.map((item) => item[2])
).size;

return (
    <div style={{ textAlign: "center", padding: "20px" }}>

      <h1>Textile Waste Intelligence Platform</h1>

      <hr />

      <h2>Registration Module</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option>Administrator</option>
        <option>Manufacturer</option>
        <option>Recycling Operator</option>
      </select>

      <br /><br />

      <button onClick={registerUser}>
        Register
      </button>

      <hr />

      <h2>Waste Inventory Module</h2>

      <input
        type="text"
        placeholder="Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Fabric Type"
        value={fabricType}
        onChange={(e) => setFabricType(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Condition"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={collectionDate}
        onChange={(e) => setCollectionDate(e.target.value)}
      />

      <br /><br />

      <button onClick={addInventory}>
        Add Inventory
      </button>
<hr />

<h2>Dashboard</h2>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap"
  }}
>
  <div
    style={{
      border: "1px solid white",
      padding: "20px",
      minWidth: "180px"
    }}
  >
    <h3>Total Records</h3>
    <h2>{totalRecords}</h2>
  </div>

  <div
    style={{
      border: "1px solid white",
      padding: "20px",
      minWidth: "180px"
    }}
  >
    <h3>Total Quantity</h3>
    <h2>{totalQuantity}</h2>
  </div>

  <div
    style={{
      border: "1px solid white",
      padding: "20px",
      minWidth: "180px"
    }}
  >
    <h3>Fabric Types</h3>
    <h2>{uniqueFabricTypes}</h2>
  </div>
</div>

<hr />

<h2>Inventory Records</h2>

<table
  border="1"
  style={{
    margin: "auto",
    borderCollapse: "collapse"
  }}
>
  <thead>
    <tr>
      <th>ID</th>
      <th>Batch ID</th>
      <th>Fabric Type</th>
      <th>Source</th>
      <th>Quantity</th>
      <th>Color</th>
      <th>Condition</th>
      <th>Collection Date</th>
    </tr>
  </thead>

  <tbody>
    {inventoryData.map((item) => (
      <tr key={item[0]}>
        <td>{item[0]}</td>
        <td>{item[1]}</td>
        <td>{item[2]}</td>
        <td>{item[3]}</td>
        <td>{item[4]}</td>
        <td>{item[5]}</td>
        <td>{item[6]}</td>
        <td>{item[7]}</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  );
}

export default App;