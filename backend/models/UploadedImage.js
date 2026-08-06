const mongoose = require("mongoose");

const uploadedImageSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: [true, "Image path is required"],
    },
    preprocessedImagePath: {
      type: String,
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
    },
    mimeType: {
      type: String,
      required: [true, "Mimetype is required"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UploadedImage", uploadedImageSchema);
