import Button from "@/components/ui/Button";

function DeleteInventoryModal({
  open,
  onClose,
  onConfirm,
  inventory,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold mb-4">
          Delete Inventory
        </h2>

        <p className="mb-6 text-gray-600">
          Are you sure you want to delete
          <strong> {inventory?.batch_id}</strong> ?
        </p>

        <div className="flex justify-end gap-4">

          <Button
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
          >
            Delete
          </Button>

        </div>

      </div>

    </div>
  );
}

export default DeleteInventoryModal;
