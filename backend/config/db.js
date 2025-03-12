const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB:", process.env.MONGO_URI); // Debugging

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected to Atlas...");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
