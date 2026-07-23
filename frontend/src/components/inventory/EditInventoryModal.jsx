import { useEffect, useState } from "react";
import InventoryForm from "./InventoryForm";

function EditInventoryModal({
  open,
  onClose,
  inventory,
  onSubmit,
}) {  const [formData, setFormData] = useState({
    batch_id: "",
    fabric_type: "",
    source: "",
    quantity: "",
    unit: "kg",
    color: "",
    condition: "",
    collection_date: "",
    location: "",
    status: "Pending",
  });
  useEffect(() => {
  if (inventory) {
    setFormData({
      batch_id: inventory.batch_id || "",
      fabric_type: inventory.fabric_type || "",
      source: inventory.source || "",
      quantity: inventory.quantity || "",
      unit: inventory.unit || "kg",
      color: inventory.color || "",
      condition: inventory.condition || "",
      collection_date: inventory.collection_date
        ? inventory.collection_date.substring(0, 10)
        : "",
      location: inventory.location || "",
      status: inventory.status || "Pending",
    });
  }
}, [inventory]);
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      collection_date: new Date(
        formData.collection_date
      ).toISOString(),
    });

    setFormData({
      batch_id: "",
      fabric_type: "",
      source: "",
      quantity: "",
      unit: "kg",
      color: "",
      condition: "",
      collection_date: "",
      location: "",
      status: "Pending",
    });

    onClose();
  };

  if (!open) return null;

  return (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl w-full max-w-2xl p-8">

    <h2 className="text-2xl font-bold mb-6">
  Edit Inventory
</h2>

    <InventoryForm
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onClose}
      submitText="Update Inventory"    

    />

  </div>

</div>
  );
}

export default EditInventoryModal;