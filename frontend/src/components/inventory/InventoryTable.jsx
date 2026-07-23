import InventoryRow from "./InventoryRow";

function InventoryTable({
    inventory,
    onEdit,
    onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-4 text-left">Batch ID</th>

            <th className="p-4 text-left">Fabric</th>

            <th className="p-4 text-left">Source</th>

            <th className="p-4 text-left">Quantity</th>

            <th className="p-4 text-left">Condition</th>

            <th className="p-4 text-left">Status</th>

            <th className="p-4 text-left">Actions</th>

          </tr>

        </thead>

        <tbody>

          {inventory.map((item) => (
            <InventoryRow
                key={item._id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
            />
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default InventoryTable;