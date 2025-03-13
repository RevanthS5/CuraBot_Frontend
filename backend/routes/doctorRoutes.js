const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware.js");
const { addDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor } = require("../controllers/doctorController.js");

const router = express.Router();

// ✅ Add a New Doctor (Admin Only)
router.post("/", protect, authorize("admin"), addDoctor);

// ✅ Get All Doctors (Public)
router.get("/", getAllDoctors);

// ✅ Get Doctor by ID (Public)
router.get("/:id", getDoctorById);

// ✅ Update Doctor Details (Admin Only)
router.patch("/:id", protect, authorize("admin"), updateDoctor);

// ✅ Delete a Doctor (Admin Only)
router.delete("/:id", protect, authorize("admin"), deleteDoctor);

module.exports = router;
