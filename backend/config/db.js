const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env file
// In Docker, the .env file is in the app root directory
// In development, it's in the parent directory
const envPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, '../../.env')
  : path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected to CuraBot Database...");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
