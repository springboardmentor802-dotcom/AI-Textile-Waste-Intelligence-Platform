import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import SectionHeader from "@/components/dashboard/SectionHeader";

import InventoryToolbar from "@/components/inventory/InventoryToolbar";
import InventoryTable from "@/components/inventory/InventoryTable";
import AddInventoryModal from "@/components/inventory/AddInventoryModal";
import { createInventory } from "@/services/inventoryService";
import { getInventory } from "@/services/inventoryService";
import EditInventoryModal from "@/components/inventory/EditInventoryModal";
import { updateInventory } from "@/services/inventoryService";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddInventory = async (formData) => {
  try {
    await createInventory(formData);

    await loadInventory();

    setShowModal(false);

  } catch (error) {
    console.error(error);
    alert("Failed to add inventory.");
  }
};
const handleUpdateInventory = async (formData) => {
  try {
    await updateInventory(selectedInventory._id, {
      ...formData,
      quantity: Number(formData.quantity),
      collection_date: new Date(
        formData.collection_date
      ).toISOString(),
    });

    await loadInventory();

    setShowEditModal(false);

    setSelectedInventory(null);

  } catch (error) {
    console.error(error);
    alert("Failed to update inventory.");
  }
};
const handleEditClick = (item) => {
    setSelectedInventory(item);
    setShowEditModal(true);
};

  return (
    <DashboardLayout>
      <SectionHeader
        title="Inventory"
        subtitle="Manage textile waste inventory."
      />

      <InventoryToolbar
        onAdd={() => setShowModal(true)}
      />
      {loading ? (
        <p className="mt-6">Loading inventory...</p>
      ) : (
      <InventoryTable
        inventory={inventory}
        onEdit={handleEditClick}
        onDelete={() => {}}
      />
      )}
      <AddInventoryModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddInventory}
      />
      <EditInventoryModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedInventory(null);
        }}
        inventory={selectedInventory}
        onSubmit={handleUpdateInventory}
      />
    </DashboardLayout>
  );
}

export default Inventory;