import { useState, useEffect } from "react";
import {
  getInventory,
  addInventory,
  deleteInventory,
  updateInventory
} from "../../services/inventoryService";

import "./Inventory.css";


function Inventory() {


  const [showForm, setShowForm] = useState(false);

  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  const [inventoryData, setInventoryData] = useState([]);



  const [formData, setFormData] = useState({
    material: "",
    type: "",
    weight: "",
    status: ""
  });



  useEffect(() => {

    loadInventory();

  }, []);




  const loadInventory = () => {

    getInventory()

      .then((res) => {

        const data = res.data.map((item) => ({

          id: item.textile_id,

          material: item.material_type,

          type: item.fabric_type,

          weight: item.quantity + " kg",

          status: item.condition_status

        }));


        setInventoryData(data);


      })

      .catch(console.error);

  };





  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };






  const addWaste = (e) => {

    e.preventDefault();



    if (!formData.weight || isNaN(formData.weight)) {

      alert("Enter valid weight");

      return;

    }



    const payload = {

      material: formData.material,

      type: formData.type,

      weight: parseFloat(formData.weight),

      status: formData.status

    };





    // UPDATE

    if (editId) {


      updateInventory(editId, payload)

        .then(() => {

          loadInventory();

          clearForm();

          setEditId(null);

        })

        .catch(console.error);



    }





    // ADD

    else {


      addInventory(payload)

        .then(() => {

          loadInventory();

          clearForm();

        })

        .catch(console.error);


    }


  };







  const editEntry = (item) => {


    setFormData({

      material: item.material,

      type: item.type,

      weight: item.weight.replace(" kg", ""),

      status: item.status

    });



    setEditId(item.id);

    setShowForm(true);


  };







  const deleteEntry = (id) => {


    deleteInventory(id)

      .then(() => {

        loadInventory();

      })

      .catch(console.error);


  };







  const clearForm = () => {


    setFormData({

      material: "",

      type: "",

      weight: "",

      status: ""

    });


    setShowForm(false);


  };







  const filteredData = inventoryData.filter((item) =>


    item.material?.toLowerCase()
      .includes(search.toLowerCase())


    ||

    item.type?.toLowerCase()
      .includes(search.toLowerCase())


    ||

    item.status?.toLowerCase()
      .includes(search.toLowerCase())


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
            placeholder="Weight (kg)"
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

            {editId ? "Update Entry" : "Add Entry"}

          </button>



        </form>


      )}







      <input

        className="search-box"

        placeholder="Search textile waste..."

        value={search}

        onChange={(e) => setSearch(e.target.value)}

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


            {filteredData.map((item) => (


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

                    className="edit-btn"

                    onClick={() => editEntry(item)}

                  >

                    Edit

                  </button>





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