import { useEffect, useState } from "react";
import { getInventory } from "../services/inventoryService";

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

      <table className="table-auto w-full border">

        <thead>

          <tr className="bg-green-700 text-white">

            <th className="p-3">Waste</th>

            <th>Fabric</th>

            <th>Quantity</th>

            <th>Unit</th>

            <th>Location</th>

            <th>Status</th>

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

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Inventory;