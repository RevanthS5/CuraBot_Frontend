const asyncHandler = require("express-async-handler");
const { Groq } = require("groq-sdk");
const User = require("../models/User.js");
const Doctor = require("../models/Doctor.js");
const Appointment = require("../models/Appointment.js");
const Schedule = require("../models/Schedule.js");

// ✅ Initialize Groq Client
let groq;
try {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });
    console.log("✅ Groq client initialized successfully for Admin Analytics");
} catch (error) {
    console.error("❌ Failed to initialize Groq client:", error);
}

// ✅ Admin Dashboard (Overview of System Stats)
const getAdminDashboard = asyncHandler(async (req, res) => {
    try {
        const totalPatients = await User.countDocuments({ role: "patient" });
        const totalDoctors = await Doctor.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const pendingAppointments = await Appointment.countDocuments({ status: "pending" });

        res.status(200).json({
            totalPatients,
            totalDoctors,
            totalAppointments,
            pendingAppointments,
        });
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Fetch All Patients
const getAllPatients = asyncHandler(async (req, res) => {
    try {
        const patients = await User.find({ role: "patient" }).select("-password");
        res.status(200).json(patients);
    } catch (error) {
        console.error("Error fetching patients:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Fetch Doctor Schedule & Workload Insights
const getDoctorSchedule = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        const appointments = await Appointment.find({ doctorId }).populate("patientId", "name email");
        const schedule = await Schedule.findOne({ doctorId });

        res.status(200).json({
            doctor,
            schedule,
            appointments,
        });
    } catch (error) {
        console.error("Error fetching doctor schedule:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅  Fetch All Appointments (For Admin Control)
const getAllAppointments = asyncHandler(async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patientId", "name email")
            .populate("doctorId", "name speciality");
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Reschedule or Cancel an Appointment (Admin Control)
const manageAppointments = asyncHandler(async (req, res) => {
    try {
        const { action, newDate, newTime } = req.body; // Action: "reschedule" or "cancel"
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        if (action === "reschedule") {
            appointment.date = newDate;
            appointment.time = newTime;
            appointment.status = "confirmed";
        } else if (action === "cancel") {
            appointment.status = "cancelled";
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        await appointment.save();
        res.status(200).json({ message: `Appointment ${action}d successfully`, appointment });
    } catch (error) {
        console.error("Error managing appointment:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ Manually Book an Appointment (Admin-Only)
const manuallyScheduleAppointment = asyncHandler(async (req, res) => {
    try {
        const { patientId, doctorId, date, time } = req.body;

        // Ensure doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        // Create appointment
        const appointment = new Appointment({
            patientId,
            doctorId,
            date,
            time,
            status: "confirmed",
        });

        await appointment.save();
        res.status(201).json({ message: "Appointment booked successfully", appointment });
    } catch (error) {
        console.error("Error scheduling appointment:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ✅ AI-Enhanced Admin Analytics (Now Supports Daily, Weekly & Monthly Filters)
const getAdminAnalytics = asyncHandler(async (req, res) => {
    try {
        const { period } = req.query; // Accepts "day", "week", "month"

        // Get the start date for filtering
        let startDate = new Date();
        if (period === "week") {
            startDate.setDate(startDate.getDate() - 7); // Last 7 days
        } else if (period === "month") {
            startDate.setMonth(startDate.getMonth() - 1); // Last 30 days
        } else {
            startDate.setHours(0, 0, 0, 0); // Only for today
        }

        // Fetch filtered data from MongoDB
        const totalAppointments = await Appointment.countDocuments({ date: { $gte: startDate } });
        const completedAppointments = await Appointment.countDocuments({ date: { $gte: startDate }, status: "completed" });
        const cancelledAppointments = await Appointment.countDocuments({ date: { $gte: startDate }, status: "cancelled" });

        // Aggregate Doctor Workload & Peak Time Data (Only for Selected Period)
        const doctorWorkload = await Appointment.aggregate([
            { $match: { date: { $gte: startDate } } },
            { $group: { _id: "$doctorId", totalAppointments: { $sum: 1 } } },
            { $sort: { totalAppointments: -1 } },
        ]);

        const peakHoursData = await Appointment.aggregate([
            { $match: { date: { $gte: startDate } } },
            { $group: { _id: "$time", totalAppointments: { $sum: 1 } } },
            { $sort: { totalAppointments: -1 } },
            { $limit: 5 } // Top 5 busiest times
        ]);

        // Fetch Schedule Data for Doctor Availability Insights
        const doctorSchedules = await Schedule.aggregate([
            { $match: { "availableSlots.date": { $gte: startDate } } },
            {
                $group: {
                    _id: "$doctorId",
                    totalAvailableSlots: { $sum: { $size: "$availableSlots" } },
                    bookedSlots: { $sum: { $size: "$bookedSlots" } }
                }
            }
        ]);

        // Structure Data for AI Processing
        const inputData = {
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            doctorWorkload,
            peakHoursData,
            doctorSchedules
        };

        // 🔥 Use Groq API to analyze & generate insights
        const prompt = `
        You are an AI specializing in **real-time hospital analytics**. Given the following **filtered hospital data** for the period **(${period})**, generate key insights:

        - **Total Appointments**: ${totalAppointments}
        - **Completed Appointments**: ${completedAppointments}
        - **Cancelled Appointments**: ${cancelledAppointments}
        - **Doctor Workload** (Appointments per doctor): ${JSON.stringify(doctorWorkload)}
        - **Peak Appointment Hours** (Most booked times): ${JSON.stringify(peakHoursData)}
        - **Doctor Availability** (Available & booked slots per doctor): ${JSON.stringify(doctorSchedules)}

        Provide structured insights **only for the selected period (${period})**, in JSON format:
        {
            "peakHours": ["9AM-11AM", "4PM-6PM"],
            "overloadedDoctors": [{"doctorId": "67d16bcf024e773b6fddf3ad", "totalAppointments": 12}],
            "doctorAvailability": [{"doctorId": "67d16bcf024e773b6fddf3ad", "availableSlots": 2, "bookedSlots": 8}],
            "cancellationTrends": "Most cancellations happen between 8AM-10AM",
            "recommendations": [
                "Consider extending evening consultation hours for overloaded doctors",
                "Doctors with high cancellations should send reminder notifications"
            ]
        }
        `;

        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",  // ✅ Stronger reasoning model
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 0.9,
            response_format: { type: "json_object" }
        });

        // Parse AI-generated insights
        const aiInsights = JSON.parse(response.choices[0].message.content);

        // ✅ Send response back to frontend
        res.status(200).json({
            period,
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            aiInsights
        });

    } catch (error) {
        console.error("Error fetching AI-powered analytics:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = {
    getAdminDashboard,
    getAllPatients,
    getDoctorSchedule,
    getAllAppointments,
    manageAppointments,
    manuallyScheduleAppointment,
    getAdminAnalytics,
};
