const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const MaterialClassification = require("../models/MaterialClassification");
const WasteClassification = require("../models/WasteClassification");
const UploadedImage = require("../models/UploadedImage");
const Analysis = require("../models/Analysis");
const SustainabilityRecord = require("../sustainability/models/sustainabilityModel");
const User = require("../models/User");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_textile_waste_db";

async function runTest() {
  console.log("Connecting to MongoDB:", mongoUri);
  await mongoose.connect(mongoUri);

  try {
    // Find or create test user
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        role: "Admin",
      });
    }

    console.log("Using User ID:", user._id);

    // Create 3 test records with dummy image files on disk
    const createdRecordIds = [];
    const createdUploadedImageIds = [];
    const dummyFilesCreated = [];

    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (let i = 1; i <= 3; i++) {
      const imgFileName = `test-textile-delete-${Date.now()}-${i}.jpg`;
      const prepFileName = `preprocessed-${imgFileName}`;
      const imgPathOnDisk = path.join(uploadsDir, imgFileName);
      const prepPathOnDisk = path.join(uploadsDir, prepFileName);

      fs.writeFileSync(imgPathOnDisk, "dummy raw image content");
      fs.writeFileSync(prepPathOnDisk, "dummy preprocessed image content");
      dummyFilesCreated.push(imgPathOnDisk, prepPathOnDisk);

      // Create UploadedImage
      const uploadedImg = await UploadedImage.create({
        imagePath: `/uploads/${imgFileName}`,
        preprocessedImagePath: `/uploads/${prepFileName}`,
        originalName: `test_sample_${i}.jpg`,
        mimeType: "image/jpeg",
        size: 1024,
        createdBy: user._id,
      });
      createdUploadedImageIds.push(uploadedImg._id);

      // Create MaterialClassification
      const mc = await MaterialClassification.create({
        uploadedImage: uploadedImg._id,
        materialName: i === 1 ? "Cotton" : i === 2 ? "Polyester" : "Denim",
        confidenceScore: 92,
        materialDescription: "Test material description",
        fabricDetection: "Woven",
        textureAnalysis: "Smooth texture",
        colorAnalysis: {
          dominantColors: ["#FFFFFF", "#000000"],
          paletteDescription: "White and Black",
        },
        createdBy: user._id,
      });
      createdRecordIds.push(mc._id);

      // Create WasteClassification
      await WasteClassification.create({
        uploadedImage: uploadedImg._id,
        wasteCategory: "Recyclable",
        recyclabilityScore: 85,
        reusePotential: "High",
        disposalRecommendation: "Recycle via mechanical process",
        damageDetection: { damageDetected: false },
        contaminationDetection: { contaminationDetected: false },
        createdBy: user._id,
      });

      // Create SustainabilityRecord
      await SustainabilityRecord.create({
        material: mc.materialName,
        condition: "Good",
        quantity: 10,
        recyclability: "Mechanical Recycling",
        uploadedImage: uploadedImg._id,
        createdBy: user._id,
      });

      // Create Analysis
      await Analysis.create({
        imagePath: `/uploads/${imgFileName}`,
        preprocessedImagePath: `/uploads/${prepFileName}`,
        predictedMaterial: mc.materialName,
        materialConfidence: 92,
        wasteCategory: "Recyclable",
        wasteConfidence: 85,
        recyclabilityScore: 85,
        recyclabilityGrade: "Green",
        recyclabilityGradeText: "Highly Recyclable",
        condition: "Good",
        createdBy: user._id,
      });
    }

    console.log(`\nCreated ${createdRecordIds.length} test records in MongoDB & disk files.`);

    // Import deleteHistoryRecord function from controller
    const { deleteHistoryRecord } = require("../controllers/classificationController");

    // Test deleting each record one by one
    for (let i = 0; i < createdRecordIds.length; i++) {
      const targetId = createdRecordIds[i];
      const uploadedImgId = createdUploadedImageIds[i];

      console.log(`\nDeleting record #${i + 1} with ID: ${targetId}...`);

      // Mock req and res
      let responseStatus = null;
      let responseJson = null;

      const req = { params: { id: targetId.toString() }, user };
      const res = {
        status: (code) => {
          responseStatus = code;
          return res;
        },
        json: (data) => {
          responseJson = data;
          return res;
        },
      };

      await deleteHistoryRecord(req, res);

      console.log(`API Response Status: ${responseStatus}`);
      console.log(`API Response Body:`, responseJson);

      if (responseStatus !== 200 || !responseJson?.success) {
        throw new Error(`Failed to delete record ${targetId}`);
      }

      // Verify no orphan DB records remain for this record
      const mcCount = await MaterialClassification.countDocuments({ _id: targetId });
      const wcCount = await WasteClassification.countDocuments({ uploadedImage: uploadedImgId });
      const sustCount = await SustainabilityRecord.countDocuments({ uploadedImage: uploadedImgId });
      const imgCount = await UploadedImage.countDocuments({ _id: uploadedImgId });

      console.log(`Verification after delete #${i + 1}:`);
      console.log(`- MaterialClassification count: ${mcCount} (expected 0)`);
      console.log(`- WasteClassification count: ${wcCount} (expected 0)`);
      console.log(`- SustainabilityRecord count: ${sustCount} (expected 0)`);
      console.log(`- UploadedImage count: ${imgCount} (expected 0)`);

      if (mcCount !== 0 || wcCount !== 0 || sustCount !== 0 || imgCount !== 0) {
        throw new Error(`Orphan database records found for ID ${targetId}`);
      }
    }

    // Verify files on disk were unlinked
    let orphanFilesFound = 0;
    dummyFilesCreated.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        console.error(`Orphan file still exists on disk: ${filePath}`);
        orphanFilesFound++;
      }
    });

    if (orphanFilesFound > 0) {
      throw new Error(`Found ${orphanFilesFound} orphan files on disk.`);
    }

    console.log("\n✅ ALL TESTS PASSED! Multi-record deletion verified with ZERO orphan database records or files.");
  } catch (err) {
    console.error("\n❌ Test Failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runTest();
