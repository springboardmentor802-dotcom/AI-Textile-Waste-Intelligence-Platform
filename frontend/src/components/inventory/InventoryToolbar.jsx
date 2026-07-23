import Button from "@/components/ui/Button";

function InventoryToolbar({ onAdd }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

      <div className="flex gap-4 flex-1">

        <input
          type="text"
          placeholder="Search Batch ID, Fabric..."
          className="flex-1 rounded-xl border px-4 py-3 outline-none"
        />

        <select className="rounded-xl border px-4 py-3">
          <option>All Fabrics</option>
          <option>Cotton</option>
          <option>Polyester</option>
          <option>Silk</option>
          <option>Denim</option>
        </select>

        <select className="rounded-xl border px-4 py-3">
          <option>All Status</option>
          <option>Pending</option>
          <option>Collected</option>
          <option>Processed</option>
        </select>

      </div>

      <Button onClick={onAdd}>
        + Add Inventory
      </Button>

    </div>
  );
}

export default InventoryToolbar;