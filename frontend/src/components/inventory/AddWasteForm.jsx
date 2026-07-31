import { useState } from "react";
import { addInventory, uploadImage } from "../../services/inventoryService";

function AddWasteForm() {
  const [formData, setFormData] = useState({
    waste_type: "",
    fabric_type: "",
    quantity: "",
    unit: "Kg",
    location: "",
    status: "Collected",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      let imagePath = "";

      if (image) {
        const uploadResponse = await uploadImage(image);
        imagePath = uploadResponse.path;
      }

      await addInventory({
        ...formData,
        image_path: imagePath,
        prediction: null,
      });

      alert("Waste Added Successfully!");

      setFormData({
        waste_type: "",
        fabric_type: "",
        quantity: "",
        unit: "Kg",
        location: "",
        status: "Collected",
      });

      setImage(null);

      window.location.reload();

    } catch (err) {
      console.log(err);
      alert("Failed to save waste");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">

      <h2 className="text-2xl font-bold mb-4">
        Add Waste Batch
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <input
          name="waste_type"
          placeholder="Waste Type"
          className="border p-2 rounded"
          value={formData.waste_type}
          onChange={handleChange}
        />

        <input
          name="fabric_type"
          placeholder="Fabric Type"
          className="border p-2 rounded"
          value={formData.fabric_type}
          onChange={handleChange}
        />

        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          className="border p-2 rounded"
          value={formData.quantity}
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location"
          className="border p-2 rounded"
          value={formData.location}
          onChange={handleChange}
        />

        <select
          name="status"
          className="border p-2 rounded"
          value={formData.status}
          onChange={handleChange}
        >
          <option>Collected</option>
          <option>Processing</option>
          <option>Recycled</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-700 text-white px-5 py-2 rounded mt-5"
      >
        Save Waste
      </button>

    </div>
  );
}

export default AddWasteForm;