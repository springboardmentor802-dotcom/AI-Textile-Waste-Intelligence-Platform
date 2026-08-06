const UploadedImage = require("../models/UploadedImage");

// @desc    Upload textile image
// @route   POST /api/upload
// @access  Protected
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid textile image (JPG, JPEG, PNG, or WEBP) for analysis.",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Create and save uploaded image record
    const uploadedImage = await UploadedImage.create({
      imagePath: imageUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded and saved successfully.",
      data: uploadedImage,
    });
  } catch (error) {
    console.error("Upload Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image.",
    });
  }
};

module.exports = {
  uploadImage,
};
