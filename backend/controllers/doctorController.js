const Doctor = require("../models/Doctor.js");
const User = require("../models/User.js");

// ✅ Add a New Doctor (Admin Only)
const addDoctor = async (req, res) => {
    try {
        const { userId, name, profilePic, speciality, qualification, overview, expertise } = req.body;

        // Check if the user exists and is a doctor
        const user = await User.findById(userId);
        if (!user || user.role !== "doctor") {
            return res.status(400).json({ message: "Invalid doctor user ID" });
        }

        const newDoctor = new Doctor({
            userId,
            name,
            profilePic,
            speciality,
            qualification,
            overview,
            expertise
        });

        await newDoctor.save();
        res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
    } catch (error) {
        console.error("Error adding doctor:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Get All Doctors (Public)
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Get Doctor by ID (Public)
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        res.status(200).json(doctor);
    } catch (error) {
        console.error("Error fetching doctor:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Update Doctor Details (Admin Only)
const updateDoctor = async (req, res) => {
    try {
        const { name, profilePic, speciality, qualification, overview, expertise } = req.body;
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        doctor.name = name || doctor.name;
        doctor.profilePic = profilePic || doctor.profilePic;
        doctor.speciality = speciality || doctor.speciality;
        doctor.qualification = qualification || doctor.qualification;
        doctor.overview = overview || doctor.overview;
        doctor.expertise = expertise || doctor.expertise;

        await doctor.save();
        res.status(200).json({ message: "Doctor updated successfully", doctor });
    } catch (error) {
        console.error("Error updating doctor:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Delete Doctor (Admin Only)
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        await doctor.deleteOne();
        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
        console.error("Error deleting doctor:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { addDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor };
