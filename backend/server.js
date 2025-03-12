const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Express
const app = express();

// Connect to Database
connectDB();

console.log("✅ MongoDB connection established");

// Default Route (AFTER app initialization)
app.get("/", (req, res) => {
    res.send("CuraBot Backend is Running on nodemon!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
