const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Load Routes
app.use("/api/auth", require("./routes/authRoutes")); // 🔥 Auth Routes
app.use("/api/admin", require("./routes/adminRoutes")); // 🔥 Admin Routes
app.use("/api/doctors", require("./routes/doctorRoutes")); // 🔥 Doctor routes

// Default Route
app.get("/", (req, res) => {
  res.send("CuraBot Backend is Running using env!");
});

// Start Server
const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
