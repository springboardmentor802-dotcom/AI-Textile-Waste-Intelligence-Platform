import { useEffect, useState } from "react";
import { getInventory } from "../services/inventoryService";
import AddWasteForm from "../components/inventory/AddWasteForm";

function Inventory() {
  const [inventory, setInventory] = useState([]);

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

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Inventory Management
      </h1>

      <AddWasteForm />

      <table className="table-auto w-full border border-collapse">

        <thead>
          <tr className="bg-green-700 text-white">
            <th className="p-3">Waste</th>
            <th>Fabric</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Location</th>
            <th>Status</th>
            <th>Image</th>
            <th>Prediction</th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((item) => (
            <tr key={item.id} className="border">

              <td className="p-3">{item.waste_type}</td>

              <td>{item.fabric_type}</td>

              <td>{item.quantity}</td>

              <td>{item.unit}</td>

              <td>{item.location}</td>

              <td>{item.status}</td>

              <td>
                {item.image_path ? (
                  <img
                    src={`http://127.0.0.1:8000/${item.image_path}`}
                    alt="Waste"
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  "No Image"
                )}
              </td>

              <td>
                {item.prediction ? item.prediction : "Pending"}
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}

export default Inventory;