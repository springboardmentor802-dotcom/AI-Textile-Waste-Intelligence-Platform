import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function InventoryForm({
  formData,
  onChange,
  onSubmit,
  submitText = "Save",
  onCancel,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-2 gap-4"
    >
      <Input
        label="Batch ID"
        name="batch_id"
        value={formData.batch_id}
        onChange={onChange}
        required
      />

      <Input
        label="Fabric Type"
        name="fabric_type"
        value={formData.fabric_type}
        onChange={onChange}
        required
      />

      <Input
        label="Source"
        name="source"
        value={formData.source}
        onChange={onChange}
        required
      />

      <Input
        label="Quantity"
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={onChange}
        required
      />

      <Input
        label="Color"
        name="color"
        value={formData.color}
        onChange={onChange}
        required
      />

      <Input
        label="Condition"
        name="condition"
        value={formData.condition}
        onChange={onChange}
        required
      />

      <Input
        label="Collection Date"
        type="date"
        name="collection_date"
        value={formData.collection_date}
        onChange={onChange}
        required
      />

      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={onChange}
        required
      />

      <div className="col-span-2 flex justify-end gap-4 mt-4">
        <Button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit">
          {submitText}
        </Button>
      </div>
    </form>
  );
}

export default InventoryForm;