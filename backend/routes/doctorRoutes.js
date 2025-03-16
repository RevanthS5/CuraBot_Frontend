const express = require("express");
const { getAllDoctors, getDoctorById } = require("../controllers/doctorController.js");

const router = express.Router();

// ✅ Get All Doctors (Public)
router.get("/", getAllDoctors);

// ✅ Get Doctor by ID (Public)
router.get("/:id", getDoctorById);

module.exports = router;
