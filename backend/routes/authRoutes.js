const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// ✅ User Registration Route
router.post("/register", registerUser);

// ✅ User Login Route
router.post("/login", loginUser);

// ✅ Protected Route: Get User Profile (Only Logged-in Users)
router.get("/me", protect, (req, res) => {
  res.json({ message: "User authorized", user: req.user });
});

module.exports = router;
