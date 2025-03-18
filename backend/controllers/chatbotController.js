const asyncHandler = require("express-async-handler");
const { Groq } = require("groq-sdk");
const Chat = require("../models/Chat.js");
const Doctor = require("../models/Doctor.js");
const Schedule = require("../models/Schedule.js");
const Appointment = require("../models/Appointment.js");
const User = require("../models/User.js");
const mongoose = require("mongoose");

// ✅ Initialize Groq SDK
let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  console.log("✅ Groq client initialized successfully for Chatbot");
} catch (error) {
  console.error("❌ Failed to initialize Groq client:", error);
}

// ✅ Enhanced AI-Powered Medical Assistant with Multiple Capabilities
const processUserQuery = async (userId, message, chatHistory) => {
  // Get all doctors for reference
  const doctors = await getAllDoctors();
  
  // Extract intent from user message
  const intent = await determineUserIntent(message, chatHistory);
  
  // Process based on intent
  switch (intent.type) {
    case "symptom_analysis":
      return await handleSymptomAnalysis(userId, message, chatHistory, doctors);
    case "doctor_availability":
      return await handleDoctorAvailability(intent.doctorId, intent.date);
    case "appointment_info":
      return await handleAppointmentInfo(userId, intent.appointmentId);
    case "doctor_info":
      return await handleDoctorInfo(intent.doctorId);
    case "reschedule_request":
      return await handleRescheduleRequest(userId, intent.appointmentId, intent.newDate, intent.newTime);
    case "general_question":
      return await handleGeneralQuestion(message);
    default:
      return {
        message: "I'm not sure how to help with that. You can ask me about doctor availability, your appointments, or describe your symptoms for a doctor recommendation."
      };
  }
};

// ✅ Determine user intent using LLM
const determineUserIntent = async (message, chatHistory) => {
  const prompt = `
  You are an AI assistant for a healthcare application. Analyze the following user message and determine the user's intent.
  
  User message: "${message}"
  
  Previous conversation context:
  ${chatHistory.slice(-5).map(m => `${m.sender}: ${m.message}`).join("\n")}
  
  Identify the primary intent from these categories:
  1. symptom_analysis - User is describing symptoms or health concerns
  2. doctor_availability - User is asking when a doctor is available (extract doctorId if mentioned and date if specified)
  3. appointment_info - User is asking about their appointment details (extract appointmentId if mentioned)
  4. doctor_info - User is asking about a specific doctor's information (extract doctorId)
  5. reschedule_request - User wants to reschedule an appointment (extract appointmentId, newDate, newTime if mentioned)
  6. general_question - User is asking a general healthcare question
  
  Respond in JSON format:
  {
    "type": "intent_type",
    "doctorId": "doctor_id_if_mentioned_or_null",
    "appointmentId": "appointment_id_if_mentioned_or_null",
    "date": "date_if_mentioned_or_null",
    "newDate": "new_date_if_mentioned_for_reschedule_or_null",
    "newTime": "new_time_if_mentioned_for_reschedule_or_null"
  }
  `;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error determining intent:", error);
    return { type: "general_question" };
  }
};

// ✅ Handle symptom analysis (existing functionality enhanced)
const handleSymptomAnalysis = async (userId, message, chatHistory, doctors) => {
  const previousMessages = chatHistory.filter(m => m.sender === "user").map(m => m.message);
  const extractedSymptoms = previousMessages.flatMap(m => m.split(" "));
  
  const analysis = await analyzeSymptomsWithGroq(extractedSymptoms, previousMessages, doctors);
  
  const totalQuestionsAsked = chatHistory.filter(m => m.sender === "bot" && m.message.includes("?")).length;
  
  if (totalQuestionsAsked < 2 && analysis.followUpQuestions && analysis.followUpQuestions.length > 0) {
    return { response: analysis.followUpQuestions[0] };
  }
  
  const recommendedDoctors = analysis.recommendedDoctors;
  
  if (!recommendedDoctors || recommendedDoctors.length === 0) {
    return { response: "I'm sorry, I couldn't find suitable doctors for your symptoms at this time." };
  }
  
  return {
    message: "Based on your symptoms, here are the best doctor recommendations:",
    doctors: recommendedDoctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      speciality: doc.speciality,
      qualification: doc.qualification,
      reasoning: doc.reasoning
    }))
  };
};

// ✅ NEW: Handle doctor availability queries
const handleDoctorAvailability = async (doctorId, date) => {
  try {
    // If doctorId is a name or partial name, try to find the doctor
    let doctor;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      const doctors = await Doctor.find({
        name: { $regex: doctorId, $options: 'i' }
      });
      
      if (doctors.length === 0) {
        return { 
          response: `I couldn't find a doctor matching "${doctorId}". Could you please provide the full name or try another doctor?` 
        };
      } else if (doctors.length > 1) {
        return {
          message: "I found multiple doctors matching that name. Which one did you mean?",
          doctors: doctors.map(doc => ({
            id: doc._id,
            name: doc.name,
            speciality: doc.speciality,
            qualification: doc.qualification
          }))
        };
      }
      
      doctor = doctors[0];
      doctorId = doctor._id;
    } else {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return { response: "I couldn't find that doctor in our system." };
      }
    }
    
    // Get doctor's schedule
    const schedule = await Schedule.findOne({ doctorId });
    if (!schedule || !schedule.availableSlots || schedule.availableSlots.length === 0) {
      return { 
        response: `Dr. ${doctor.name} doesn't have any available slots in the schedule yet.` 
      };
    }
    
    // Filter by date if provided
    let availableSlots = schedule.availableSlots;
    if (date) {
      const targetDate = new Date(date);
      availableSlots = availableSlots.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate.toDateString() === targetDate.toDateString();
      });
      
      if (availableSlots.length === 0) {
        return { 
          response: `Dr. ${doctor.name} doesn't have any available slots on ${new Date(date).toDateString()}.` 
        };
      }
    } else {
      // If no date provided, get the next 5 days with availability
      availableSlots = availableSlots
        .filter(slot => new Date(slot.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    }
    
    // Format the response
    const formattedSlots = availableSlots.map(slot => {
      const slotDate = new Date(slot.date);
      const availableTimes = slot.times
        .filter(time => !time.isBooked)
        .map(time => time.time);
      
      return {
        date: slotDate.toDateString(),
        availableTimes: availableTimes
      };
    });
    
    return {
      message: `Here's Dr. ${doctor.name}'s availability:`,
      doctorId: doctor._id,
      doctorName: doctor.name,
      availability: formattedSlots
    };
  } catch (error) {
    console.error("Error handling doctor availability:", error);
    return { response: "I'm having trouble checking the doctor's availability right now. Please try again later." };
  }
};

// ✅ NEW: Handle appointment information queries
const handleAppointmentInfo = async (userId, appointmentId) => {
  try {
    let query = { patientId: userId };
    
    // If specific appointment ID is provided
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      query._id = appointmentId;
    }
    
    // Find appointments
    const appointments = await Appointment.find(query)
      .sort({ date: 1 })
      .populate('doctorId', 'name speciality qualification')
      .limit(5);
    
    if (appointments.length === 0) {
      return { response: "You don't have any upcoming appointments scheduled." };
    }
    
    return {
      message: appointmentId ? "Here's your appointment information:" : "Here are your upcoming appointments:",
      appointments: appointments.map(appt => ({
        id: appt._id,
        doctor: appt.doctorId.name,
        speciality: appt.doctorId.speciality,
        date: new Date(appt.date).toDateString(),
        time: appt.time,
        status: appt.status
      }))
    };
  } catch (error) {
    console.error("Error handling appointment info:", error);
    return { response: "I'm having trouble retrieving your appointment information right now. Please try again later." };
  }
};

// ✅ NEW: Handle doctor information queries
const handleDoctorInfo = async (doctorId) => {
  try {
    // If doctorId is a name or partial name, try to find the doctor
    let doctor;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      const doctors = await Doctor.find({
        name: { $regex: doctorId, $options: 'i' }
      });
      
      if (doctors.length === 0) {
        return { 
          response: `I couldn't find a doctor matching "${doctorId}". Could you please provide the full name or try another doctor?` 
        };
      } else if (doctors.length > 1) {
        return {
          message: "I found multiple doctors matching that name. Which one did you mean?",
          doctors: doctors.map(doc => ({
            id: doc._id,
            name: doc.name,
            speciality: doc.speciality,
            qualification: doc.qualification
          }))
        };
      }
      
      doctor = doctors[0];
    } else {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return { response: "I couldn't find that doctor in our system." };
      }
    }
    
    // Get doctor's upcoming availability count
    const schedule = await Schedule.findOne({ doctorId: doctor._id });
    let availabilityCount = 0;
    
    if (schedule && schedule.availableSlots) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      availabilityCount = schedule.availableSlots
        .filter(slot => new Date(slot.date) >= today)
        .reduce((count, slot) => {
          return count + slot.times.filter(time => !time.isBooked).length;
        }, 0);
    }
    
    return {
      message: `Here's information about Dr. ${doctor.name}:`,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        speciality: doctor.speciality,
        qualification: doctor.qualification,
        expertise: doctor.expertise,
        overview: doctor.overview,
        availableSlots: availabilityCount
      }
    };
  } catch (error) {
    console.error("Error handling doctor info:", error);
    return { response: "I'm having trouble retrieving the doctor's information right now. Please try again later." };
  }
};

// ✅ NEW: Handle appointment reschedule requests
const handleRescheduleRequest = async (userId, appointmentId, newDate, newTime) => {
  try {
    // This is just information - actual rescheduling would be done through the appointment API
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return { 
        response: "To reschedule an appointment, please specify which appointment you'd like to change. You can ask me 'What are my appointments?' to see your scheduled appointments first." 
      };
    }
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: userId
    }).populate('doctorId', 'name');
    
    if (!appointment) {
      return { response: "I couldn't find that appointment in your records." };
    }
    
    // If no new date/time specified, just provide info
    if (!newDate && !newTime) {
      return {
        message: `Your appointment with Dr. ${appointment.doctorId.name} is currently scheduled for ${new Date(appointment.date).toDateString()} at ${appointment.time}.`,
        note: "To reschedule, please specify a new date and time, or visit the appointments page."
      };
    }
    
    return {
      message: `I understand you want to reschedule your appointment with Dr. ${appointment.doctorId.name}.`,
      note: "To complete the rescheduling process, please use the 'Reschedule' button on the appointments page. I've noted your preferred new date/time."
    };
  } catch (error) {
    console.error("Error handling reschedule request:", error);
    return { response: "I'm having trouble processing your reschedule request right now. Please try again later or use the appointments page." };
  }
};

// ✅ NEW: Handle general healthcare questions
const handleGeneralQuestion = async (message) => {
  try {
    const prompt = `
    You are a helpful healthcare assistant. Answer the following question with accurate, 
    medically sound information. Keep your answer concise (maximum 3-4 sentences) and helpful.
    If the question requires a doctor's specific medical advice, politely explain that the user 
    should consult with a healthcare professional.
    
    User question: "${message}"
    `;
    
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 300
    });
    
    return { response: response.choices[0].message.content.trim() };
  } catch (error) {
    console.error("Error handling general question:", error);
    return { response: "I'm sorry, I'm having trouble answering your question right now. Please try again later." };
  }
};

// ✅ AI-Generated Follow-Up Questions & Analysis Using Groq (LIMITED to 2-3 Questions)
const analyzeSymptomsWithGroq = async (symptoms, previousAnswers = [], doctorList) => {
  const followUpLimit = 2; // Max 2 follow-up questions

  const prompt = `
  You are a medical assistant AI that helps diagnose symptoms and recommend the best doctor.

  Symptoms so far: ${symptoms.join(", ")}
  Additional patient responses: ${previousAnswers.join(", ")}

  Here is the list of available doctors:
  ${doctorList.map(doc => `
    ID: ${doc._id}
    Name: ${doc.name}
    Speciality: ${doc.speciality}
    Qualification: ${doc.qualification}
    Expertise: ${doc.expertise.join(", ")}
    Overview: ${doc.overview.substring(0, 300)}...
  `).join("\n\n")}

  Please analyze the symptoms and:
  1. Extract any additional symptoms mentioned.
  2. Generate up to ${followUpLimit} follow-up questions to better understand the condition.
  3. If enough data is available, recommend the 3 best doctors based on expertise, specialization, and patient condition.
  4. Provide a simple 2-line reason for each recommended doctor.

  Respond in JSON format:
  {
    "extractedSymptoms": ["symptom1", "symptom2"],
    "followUpQuestions": ["question1", "question2"],
    "recommendedDoctors": [
      {
        "id": "doctor_id_1",
        "name": "Doctor's Name",
        "speciality": "Doctor's Speciality",
        "qualification": "Doctor's Qualification",
        "reasoning": "Simple reason (2 lines max)"
      },
      {
        "id": "doctor_id_2",
        "name": "Doctor's Name",
        "speciality": "Doctor's Speciality",
        "qualification": "Doctor's Qualification",
        "reasoning": "Simple reason (2 lines max)"
      },
      {
        "id": "doctor_id_3",
        "name": "Doctor's Name",
        "speciality": "Doctor's Speciality",
        "qualification": "Doctor's Qualification",
        "reasoning": "Simple reason (2 lines max)"
      }
    ]
  }
  `;

  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.1-8b-instant",
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 0.9,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
};

// ✅ Store Chat in MongoDB
const saveChatMessage = async (userId, sender, message) => {
  let chat = await Chat.findOne({ userId });

  if (!chat) {
    chat = new Chat({ userId, messages: [] });
  }

  chat.messages.push({ sender, message });
  await chat.save();
};

// ✅ Fetch ALL Doctors from MongoDB (LLM Will Decide Best Match)
const getAllDoctors = async () => {
  const doctors = await Doctor.find({});
  return doctors;
};

// ✅ Enhanced Chatbot API: Handles Entire Conversation Flow with Multiple Capabilities
const chatbotResponse = asyncHandler(async (req, res) => {
  const { userId, message } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  // ✅ If no message is provided, greet the user automatically
  if (!message) {
    await saveChatMessage(userId, "bot", "Hi, I'm CuraBot! How may I assist you today? You can ask me about doctor availability, your appointments, or describe your symptoms for a doctor recommendation.");
    return res.status(200).json({ 
      response: "Hi, I'm CuraBot! How may I assist you today? You can ask me about doctor availability, your appointments, or describe your symptoms for a doctor recommendation." 
    });
  }

  // ✅ Retrieve chat history
  let chat = await Chat.findOne({ userId });

  if (!chat) {
    chat = new Chat({ userId, messages: [] });
    await saveChatMessage(userId, "bot", "Hi, I'm CuraBot! How may I assist you today? You can ask me about doctor availability, your appointments, or describe your symptoms for a doctor recommendation.");
  }

  // ✅ Store user message in chat history
  await saveChatMessage(userId, "user", message);

  // ✅ Process the user's query with enhanced capabilities
  const response = await processUserQuery(userId, message, chat.messages);

  // ✅ Store bot response in chat history
  await saveChatMessage(userId, "bot", typeof response === 'object' ? JSON.stringify(response) : response);

  return res.status(200).json(response);
});

module.exports = { chatbotResponse };
