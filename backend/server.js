const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const path = require("path");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve Static Uploaded Images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/analyze", require("./routes/analyzeRoutes"));
app.use("/api/materials", require("./routes/materialsRoutes"));
app.use("/api/classification", require("./routes/classificationRoutes"));
app.use("/api/predict", require("./routes/predictRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/sustainability", require("./sustainability/routes/sustainabilityRoutes"));
app.use("/api/recommendation", require("./recommendation/routes/recommendationRoutes"));



// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running smoothly" });
});

// Default Route
app.get("/", (req, res) => {
  res.send("AI Textile Waste Intelligence Platform Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});