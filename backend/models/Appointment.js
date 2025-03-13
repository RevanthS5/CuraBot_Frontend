const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Links to Users Collection
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true }, // Links to Doctors Collection
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", required: true }, // Links to Schedule Collection
    date: { type: Date, required: true }, // Appointment Date
    time: { type: String, required: true }, // Time Slot
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" }, // Appointment Status
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
