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
  const [preview, setPreview] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imagePath = "";

      if (image) {
        const uploadResponse = await uploadImage(image);
        imagePath = uploadResponse.path;
      }

      await addInventory({
        ...formData,
        quantity: Number(formData.quantity),
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
      setPreview("");

      window.location.reload();

    } catch (err) {
      console.log(err);
      alert("Failed to save waste");
    }
  };

  return (
    <div className="bg-white rounded-2xl">

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Waste Type */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waste Type
            </label>

            <select
              name="waste_type"
              value={formData.waste_type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Waste Type</option>
              <option value="Reusable Textile Waste">
                Reusable Textile Waste
              </option>
              <option value="Recyclable Textile Waste">
                Recyclable Textile Waste
              </option>
              <option value="Non-Recyclable Textile Waste">
                Non-Recyclable Textile Waste
              </option>
            </select>
          </div>

          {/* Fabric Type */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fabric Type
            </label>

            <select
              name="fabric_type"
              value={formData.fabric_type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Fabric Type</option>

              <option value="Cotton Poplin">
                Cotton Poplin
              </option>

              <option value="Cotton Twill">
                Cotton Twill
              </option>

              <option value="Cotton Shirting Fabric">
                Cotton Shirting Fabric
              </option>

              <option value="Polyester Canvas">
                Polyester Canvas
              </option>

              <option value="Polyester Twill">
                Polyester Twill
              </option>

              <option value="Polyester Jersey Knit">
                Polyester Jersey Knit
              </option>

              <option value="Denim Heavy Cotton Twill">
                Denim Heavy Cotton Twill
              </option>

              <option value="Denim Indigo Twill">
                Denim Indigo Twill
              </option>

              <option value="Jacquard Fabric">
                Jacquard Fabric
              </option>

              <option value="Jacquard Upholstery Fabric">
                Jacquard Upholstery Fabric
              </option>
            </select>
          </div>

          {/* Quantity */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              min="0"
              step="0.01"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Unit */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>

            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Kg">Kilograms (Kg)</option>
              <option value="Ton">Ton</option>
              <option value="Piece">Piece</option>
            </select>
          </div>

          {/* Location */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Storage Location
            </label>

            <input
              type="text"
              name="location"
              placeholder="e.g. Warehouse A"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Status */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Collected">
                Collected
              </option>

              <option value="Processing">
                Processing
              </option>

              <option value="Recycled">
                Recycled
              </option>
            </select>
          </div>

        </div>

        {/* Image */}

        <div className="mt-5">

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Textile Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 p-3 rounded-lg"
          />

        </div>

        {/* Image Preview */}

        {preview && (
          <div className="mt-5">

            <p className="text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </p>

            <img
              src={preview}
              alt="Textile Preview"
              className="w-32 h-32 object-cover rounded-xl shadow"
            />

          </div>
        )}

        {/* Save Button */}

        <button
          type="submit"
          className="mt-6 bg-green-700 text-white px-6 py-3
                     rounded-lg font-semibold hover:bg-green-800
                     transition"
        >
          Add Waste to Inventory
        </button>

      </form>

    </div>
  );
}

export default AddWasteForm;