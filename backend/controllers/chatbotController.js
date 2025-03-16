const asyncHandler = require("express-async-handler");
const { Groq } = require("groq-sdk");
const Chat = require("../models/Chat.js");
const Doctor = require("../models/Doctor.js");

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
    model: "deepseek-r1-distill-qwen-32b",
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

// ✅ Chatbot API: Handles Entire Conversation Flow
const chatbotResponse = asyncHandler(async (req, res) => {
  const { userId, message } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  // ✅ If no message is provided, greet the user automatically
  if (!message) {
    await saveChatMessage(userId, "bot", "Hi, I'm CuraBot! How may I assist you today?");
    return res.status(200).json({ response: "Hi, I'm CuraBot! How may I assist you today?" });
  }

  // ✅ Retrieve chat history
  let chat = await Chat.findOne({ userId });

  if (!chat) {
    chat = new Chat({ userId, messages: [] });
    await saveChatMessage(userId, "bot", "Hi, I'm CuraBot! How may I assist you today?");
  }

  // ✅ Store user message in chat history
  await saveChatMessage(userId, "user", message);

  // ✅ Extract previous symptoms and answers from chat history
  const previousMessages = chat.messages.filter(m => m.sender === "user").map(m => m.message);
  const extractedSymptoms = previousMessages.flatMap(m => m.split(" "));

  // ✅ Get All Doctors from MongoDB
  const doctors = await getAllDoctors();

  // ✅ Analyze Symptoms & Doctors Together with Groq API
  const analysis = await analyzeSymptomsWithGroq(extractedSymptoms, previousMessages, doctors);

  // ✅ Limit Follow-Up Questions to Maximum 2, Then Recommend 3 Doctors
  const totalQuestionsAsked = chat.messages.filter(m => m.sender === "bot" && m.message.includes("?")).length;

  if (totalQuestionsAsked < 2 && analysis.followUpQuestions && analysis.followUpQuestions.length > 0) {
    const nextQuestion = analysis.followUpQuestions[0];
    await saveChatMessage(userId, "bot", nextQuestion);
    return res.status(200).json({ response: nextQuestion });
  }

  // ✅ Final Response: Recommend 3 Best Doctors
  const recommendedDoctors = analysis.recommendedDoctors;

  if (!recommendedDoctors || recommendedDoctors.length === 0) {
    return res.status(200).json({ response: "I'm sorry, I couldn't find suitable doctors for your symptoms at this time." });
  }

  const finalResponse = {
    message: "Based on your symptoms, here are the 3 best doctor recommendations:",
    doctors: recommendedDoctors.map(doc => ({
      id: doc.id,
      name: doc.name,
      speciality: doc.speciality,
      qualification: doc.qualification,
      reasoning: doc.reasoning
    }))
  };

  await saveChatMessage(userId, "bot", JSON.stringify(finalResponse));

  return res.status(200).json(finalResponse);
});

module.exports = { chatbotResponse };
