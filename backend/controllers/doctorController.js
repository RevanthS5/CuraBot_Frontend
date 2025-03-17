const asyncHandler = require("express-async-handler");
const { Groq } = require("groq-sdk");
const Appointment = require("../models/Appointment.js");
const Chat = require("../models/Chat.js");
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

// ✅ Initialize Groq Client
let groq;
try {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
    console.log("✅ Groq client initialized successfully for patient summary");
} catch (error) {
    console.error("❌ Failed to initialize Groq client:", error);
}

// ✅ Get Today’s Appointments for Doctor
const getTodayAppointments = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            doctorId,
            date: { $gte: today, $lt: new Date(today.getTime() + 86400000) }
        })
        .populate("patientId", "name email")
        .sort({ time: 1 });

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching doctor's appointments:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Get Appointments by Selected Date
const getAppointmentsByDate = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.user.id; 
        const { date } = req.query;
        
        if (!date) return res.status(400).json({ message: "Date is required" });

        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            doctorId,
            date: { $gte: selectedDate, $lt: new Date(selectedDate.getTime() + 86400000) }
        })
        .populate("patientId", "name email")
        .sort({ time: 1 });

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching doctor's appointments:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ AI-Generated Patient Summary
const getPatientSummary = asyncHandler(async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        const appointment = await Appointment.findById(appointmentId).populate("patientId", "name email");
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        const chatHistory = await Chat.findOne({ userId: appointment.patientId._id });
        if (!chatHistory) return res.status(404).json({ message: "No chatbot history found for this patient" });

        const prompt = `
        Patient Name: ${appointment.patientId.name}
        Chat History: ${JSON.stringify(chatHistory.messages)}

        Generate a structured **short AI summary** of the patient's symptoms.
        
        JSON format:
        {
            "patientName": "John Doe",
            "symptoms": ["Headache", "Dizziness"],
            "possibleDiagnosis": "Migraine",
            "additionalNotes": "Patient reports severe headaches in the morning."
        }
        `;

        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 0.9,
            response_format: { type: "json_object" }
        });

        const aiSummary = JSON.parse(response.choices[0].message.content);

        res.status(200).json(aiSummary);
    } catch (error) {
        console.error("Error generating AI summary:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = { addDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor,getTodayAppointments, getAppointmentsByDate, getPatientSummary };
