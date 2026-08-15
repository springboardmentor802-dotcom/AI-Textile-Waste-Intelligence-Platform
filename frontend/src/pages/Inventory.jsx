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
    `${item.fabric_type || ""}
     ${item.waste_type || ""}
     ${item.location || ""}
     ${item.status || ""}
     ${item.prediction || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Inventory Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage textile waste inventory and AI predictions.
          </p>
        </div>

        <div className="mt-5 md:mt-0 bg-white rounded-xl shadow px-6 py-4 text-center">
          <p className="text-gray-500 text-sm">
            Total Records
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            {inventory.length}
          </h2>
        </div>

      </div>


      {/* Search */}

      <div className="bg-white rounded-2xl shadow-lg p-5 mb-8">

        <input
          type="text"
          placeholder="🔍 Search by material, waste, location or status..."
          className="w-full border border-gray-300 rounded-xl p-4
                     focus:outline-none focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* Add Inventory */}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

        <div className="mb-5">

          <h2 className="text-2xl font-bold text-gray-800">
            Add Waste Record
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Add textile waste details to your inventory.
          </p>

        </div>

        <AddWasteForm />

      </div>


      {/* Inventory Table */}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

        <div className="p-6 border-b">

          <div className="flex justify-between items-center">

            <div>

              <h2 className="text-2xl font-bold text-gray-800">
                Inventory Records
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                {filteredInventory.length} record
                {filteredInventory.length !== 1 ? "s" : ""} found
              </p>

            </div>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-green-700 text-white">

              <tr>

                <th className="p-4 text-left">
                  Image
                </th>

                <th className="p-4 text-left">
                  Material
                </th>

                <th className="p-4 text-left">
                  Waste Type
                </th>

                <th className="p-4 text-left">
                  Quantity
                </th>

                <th className="p-4 text-left">
                  Location
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  AI Prediction
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredInventory.length > 0 ? (

                filteredInventory.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    {/* Image */}

                    <td className="p-4">

                      {item.image_path ? (

                        <img
                          src={`http://127.0.0.1:8000/${item.image_path}`}
                          alt="Textile"
                          className="w-20 h-20 rounded-xl object-cover shadow"
                        />

                      ) : (

                        <div className="w-20 h-20 bg-gray-100 rounded-xl
                                        flex items-center justify-center
                                        text-2xl">
                          📦
                        </div>

                      )}

                    </td>


                    {/* Material */}

                    <td className="p-4">

                      <span className="font-semibold text-gray-800">
                        {item.fabric_type}
                      </span>

                    </td>


                    {/* Waste */}

                    <td className="p-4">

                      <span className="bg-purple-100 text-purple-700
                                       px-3 py-1 rounded-full text-sm">
                        {item.waste_type}
                      </span>

                    </td>


                    {/* Quantity */}

                    <td className="p-4">

                      <span className="font-medium">
                        {item.quantity}
                      </span>

                      <span className="text-gray-500 ml-1">
                        {item.unit}
                      </span>

                    </td>


                    {/* Location */}

                    <td className="p-4 text-gray-600">

                      📍 {item.location}

                    </td>


                    {/* Status */}

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm
                          ${
                            item.status === "Recycled"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {item.status}
                      </span>

                    </td>


                    {/* Prediction */}

                    <td className="p-4">

                      {item.prediction ? (

                        <span className="bg-blue-100 text-blue-700
                                         px-3 py-1 rounded-full text-sm">
                          {item.prediction}
                        </span>

                      ) : (

                        <span className="bg-gray-100 text-gray-500
                                         px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>

                      )}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-12"
                  >

                    <div className="text-4xl mb-3">
                      📦
                    </div>

                    <h3 className="text-lg font-semibold text-gray-700">
                      No inventory records found
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {search
                        ? "Try a different search term."
                        : "Add your first textile waste record above."}
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Inventory;