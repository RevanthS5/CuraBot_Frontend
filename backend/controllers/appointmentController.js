const Appointment = require("../models/Appointment.js");
const Schedule = require("../models/Schedule.js");
const Doctor = require("../models/Doctor.js");

// ✅ Book an Appointment (Patient Only)
const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;
        const patientId = req.user.id;

        // ✅ Find the latest chatbot session of this user
        const latestChatSession = await Chat.findOne({ userId: patientId }).sort({ createdAt: -1 });

        // ✅ Ensure doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // ✅ Check if the time slot is available
        const schedule = await Schedule.findOne({ doctorId, "availableSlots.date": date });

        if (!schedule) {
            return res.status(400).json({ message: "Doctor does not have available slots on this date" });
        }

        const slotIndex = schedule.availableSlots.findIndex(slot => 
            slot.date.toISOString() === new Date(date).toISOString()
        );

        if (slotIndex === -1) {
            return res.status(400).json({ message: "Invalid date" });
        }

        const timeSlot = schedule.availableSlots[slotIndex].times.find(slot => slot.time === time);
        if (!timeSlot || timeSlot.isBooked) {
            return res.status(400).json({ message: "Time slot is not available" });
        }

        // ✅ Mark the time slot as booked
        timeSlot.isBooked = true;
        await schedule.save();

        // ✅ Create an appointment with the chatbot session ID
        const appointment = new Appointment({
            patientId,
            doctorId,
            scheduleId: schedule._id,
            date,
            time,
            chatSessionId: latestChatSession ? latestChatSession._id : null, // 🔥 Store the chatbot session if available
            status: "confirmed",
        });

        await appointment.save();

        res.status(201).json({ message: "Appointment booked successfully", appointment });

    } catch (error) {
        console.error("Error booking appointment:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Get All Appointments (Admin & Doctor)
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate("patientId doctorId", "name email speciality");
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Get Patient's Appointments (Patient Only)
const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.id }).populate("doctorId", "name speciality");
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching patient appointments:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ✅ Cancel an Appointment (Patient/Admin)
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        if (appointment.patientId.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        appointment.status = "cancelled";
        await appointment.save();

        res.status(200).json({ message: "Appointment cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling appointment:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { bookAppointment, getAllAppointments, getPatientAppointments, cancelAppointment };
