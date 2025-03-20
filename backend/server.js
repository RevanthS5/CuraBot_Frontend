const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Load .env file
// In Docker, the .env file is in the app root directory
// In development, it's in the parent directory
const envPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, '.env')
  : path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Load Routes
app.use("/api/auth", require("./routes/authRoutes")); // Auth Routes
app.use("/api/admin", require("./routes/adminRoutes")); // Admin Routes
app.use("/api/doctors", require("./routes/doctorRoutes")); // Doctor Routes
app.use("/api/schedule", require("./routes/scheduleRoutes")); // Schedule appointment routes
app.use("/api/appointments", require("./routes/appointmentRoutes")); // All appointment routes
app.use("/api/ai/chatbot", require("./routes/chatbotRoutes")); // Chatbot Routes

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, 'public')));

  // For any route that is not an API route, serve the index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).send('API endpoint not found');
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  // Default Route for development
  app.get("/", (req, res) => {
    res.send("CuraBot Backend is Running using env!");
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`MongoDB URI: ${process.env.MONGO_URI ? 'Set' : 'Not Set'}`);
console.log(`GROQ API Key: ${process.env.GROQ_API_KEY ? 'Set' : 'Not Set'}`);
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
