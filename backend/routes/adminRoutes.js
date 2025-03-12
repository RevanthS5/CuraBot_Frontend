const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware.js");

const router = express.Router();

// ✅ Admin Dashboard (Only Admins Can Access)
router.get("/dashboard", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

module.exports = router;
