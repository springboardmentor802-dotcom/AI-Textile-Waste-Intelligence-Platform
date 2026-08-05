import { useEffect, useState } from "react";
import { getInventory } from "../services/inventoryService";
import AddWasteForm from "../components/inventory/AddWasteForm";

function Inventory() {

  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    (
      item.fabric_type +
      item.waste_type +
      item.location
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Inventory Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage textile waste inventory and AI predictions.
          </p>

        </div>

        <div className="text-right">

          <p className="text-gray-500">
            Total Records
          </p>

          <h2 className="text-4xl font-bold text-green-600">
            {inventory.length}
          </h2>

        </div>

      </div>

      {/* Search */}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

        <input
          type="text"
          placeholder="🔍 Search by material, waste or location..."
          className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* Add Inventory */}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

        <h2 className="text-2xl font-bold mb-5">
          Add Waste Record
        </h2>

        <AddWasteForm />

      </div>

      {/* Inventory Table */}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">

            Inventory Records

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-green-700 text-white">

              <tr>

                <th className="p-4 text-left">Image</th>
                <th className="text-left">Material</th>
                <th className="text-left">Waste</th>
                <th className="text-left">Quantity</th>
                <th className="text-left">Location</th>
                <th className="text-left">Status</th>
                <th className="text-left">Prediction</th>

              </tr>

            </thead>

            <tbody>

              {filteredInventory.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">

                    {item.image_path ? (

                      <img
                        src={`http://127.0.0.1:8000/${item.image_path}`}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover shadow"
                      />

                    ) : (

                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">

                        📦

                      </div>

                    )}

                  </td>

                  <td className="font-semibold">

                    {item.fabric_type}

                  </td>

                  <td>

                    {item.waste_type}

                  </td>

                  <td>

                    {item.quantity} {item.unit}

                  </td>

                  <td>

                    {item.location}

                  </td>

                  <td>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                      {item.status}

                    </span>

                  </td>

                  <td>

                    {item.prediction ? (

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

                        {item.prediction}

                      </span>

                    ) : (

                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">

                        Pending

                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Inventory;