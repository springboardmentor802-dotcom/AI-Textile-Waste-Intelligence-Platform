import { useState } from "react";
import "./Inventory.css";

function Inventory() {

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");


  const [inventoryData, setInventoryData] = useState([
    {
      id: 1,
      material: "Cotton",
      type: "Fabric",
      weight: "200 kg",
      status: "Recycled",
    },
    {
      id: 2,
      material: "Polyester",
      type: "Fabric",
      weight: "150 kg",
      status: "Pending",
    },
    {
      id: 3,
      material: "Denim",
      type: "Garment",
      weight: "300 kg",
      status: "Processing",
    },
  ]);


  const [formData, setFormData] = useState({
    material: "",
    type: "",
    weight: "",
    status: "",
  });



  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };



  const addWaste = (e) => {

    e.preventDefault();

    const newEntry = {
      id: Date.now(),
      ...formData,
    };


    setInventoryData([
      ...inventoryData,
      newEntry,
    ]);


    setFormData({
      material: "",
      type: "",
      weight: "",
      status: "",
    });


    setShowForm(false);

  };



  const deleteEntry = (id) => {

    setInventoryData(
      inventoryData.filter(
        (item) => item.id !== id
      )
    );

  };



  const filteredData = inventoryData.filter((item) =>
    item.material.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.status.toLowerCase().includes(search.toLowerCase())
  );



  return (
    <div className="inventory">


      <div className="inventory-header">

        <div>
          <h1>
            Textile Inventory
          </h1>

          <p>
            Manage textile waste collection and processing records.
          </p>
        </div>


        <button
          onClick={() => setShowForm(!showForm)}
        >
          + Add Waste Entry
        </button>

      </div>



      {showForm && (

        <form
          className="waste-form"
          onSubmit={addWaste}
        >

          <input
            name="material"
            placeholder="Material"
            value={formData.material}
            onChange={handleChange}
            required
          />


          <input
            name="type"
            placeholder="Type"
            value={formData.type}
            onChange={handleChange}
            required
          />


          <input
            name="weight"
            placeholder="Weight"
            value={formData.weight}
            onChange={handleChange}
            required
          />


          <input
            name="status"
            placeholder="Status"
            value={formData.status}
            onChange={handleChange}
            required
          />


          <button>
            Add Entry
          </button>

        </form>

      )}



      <input
        className="search-box"
        placeholder="Search textile waste..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />



      <div className="table-container">

        <table>

          <thead>

            <tr>

              <th>Material</th>

              <th>Type</th>

              <th>Weight</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>



          <tbody>

            {filteredData.map((item)=>(

              <tr key={item.id}>

                <td>{item.material}</td>

                <td>{item.type}</td>

                <td>{item.weight}</td>


                <td>

                  <span className={`status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>

                </td>


                <td>

                  <button
                    className="delete-btn"
                    onClick={() => deleteEntry(item.id)}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>


        </table>


      </div>


    </div>
  );
}


export default Inventory;