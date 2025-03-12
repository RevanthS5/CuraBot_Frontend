# **CuraBot Redefined - AI-Powered Hospital Appointment System**

## **📌 Project Overview**
CuraBot Redefined is an AI-powered hospital appointment management system designed to streamline patient interactions using a chatbot, automate doctor recommendations based on symptoms, and provide seamless appointment scheduling with SMS notifications.

## **🚀 Features**
### **1. Authentication & Authorization**
- JWT-based authentication for security.
- Role-based access control (Patients, Doctors, Admins).
- Login & Signup for users.

### **2. AI Chatbot (Groq API)**
- AI-based symptom assessment.
- Suggests relevant doctors based on symptoms.
- Chat history tracking.

### **3. Doctor Management**
- Add, update, and delete doctor profiles.
- Manage doctor availability and schedules.
- Search doctors by specialization.

### **4. Appointment Booking System**
- Patients can book appointments with available doctors.
- Admins can reschedule or cancel appointments.
- Doctors can mark appointments as completed.
- Real-time appointment availability.

### **5. Notifications & Reminders (Twilio API)**
- Sends SMS confirmation for appointments.
- Automated reminders before appointments.

### **6. Admin Dashboard**
- View all appointments and doctors.
- Monitor patient flow and peak hours.
- Access hospital analytics and reports.

## **📂 Project Structure**
```
curabot-redefined/
│── backend/
│   ├── config/               # API Keys, DB Connections
│   ├── controllers/          # Business Logic (Chatbot, Appointments, etc.)
│   ├── middleware/           # JWT Authentication, Role-Based Access
│   ├── models/               # MongoDB Schemas
│   ├── routes/               # API Endpoints
│   ├── utils/                # Twilio SMS, Chatbot Helper
│   ├── server.js             # Main Express Server
│
│── frontend/
│   ├── src/
│   │   ├── api/              # API Calls
│   │   ├── components/       # UI Components
│   │   ├── context/          # Global State (Auth, Chatbot)
│   │   ├── pages/            # Pages (Login, Dashboard, Chatbot, etc.)
│   │   ├── App.js            # Main App Component
│   │   ├── index.js          # Entry Point
│
│── README.md                 # Project Documentation
```

## **📌 Backend API Endpoints**
### **Authentication**
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login and get JWT token.
- `GET /api/auth/me` - Get user details.

### **Chatbot**
- `POST /api/chatbot/query` - AI-based symptom analysis.
- `GET /api/chatbot/history/:userId` - Retrieve chat history.

### **Appointments**
- `POST /api/appointments/book` - Book an appointment.
- `GET /api/appointments/user/:userId` - Get user’s appointments.
- `PATCH /api/appointments/cancel/:appointmentId` - Cancel an appointment.

### **Doctors**
- `GET /api/doctors/all` - Get all doctors.
- `GET /api/doctors/specialty/:specialization` - Get doctors by specialization.

### **Notifications**
- `POST /api/notifications/send` - Send SMS confirmation.
- `POST /api/notifications/reminder` - Send SMS reminders.

## **⚙️ Tech Stack**
- **Frontend:** React.js, Context API
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **AI:** Groq API for Chatbot
- **Authentication:** JWT, Bcrypt
- **Notifications:** Twilio API for SMS

## **💻 Installation & Setup**
### **1. Clone the repository**
```sh
git clone https://github.com/your-repo/curabot-redefined.git
cd curabot-redefined
```

### **2. Install dependencies**
#### Backend:
```sh
cd backend
npm install
```

#### Frontend:
```sh
cd frontend
npm install
```

### **3. Set up environment variables**
Create a `.env` file in the backend directory and add:
```sh
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### **4. Start the application**
#### Backend:
```sh
cd backend
npm start
```
#### Frontend:
```sh
cd frontend
npm start
```

## **🚀 Deployment**
- **Backend:** Deploy on Heroku/AWS
- **Frontend:** Deploy on Vercel/Netlify
- **Database:** Use MongoDB Atlas

## **📌 Future Enhancements**
- Add WhatsApp integration for notifications.
- Implement video consultation feature.
- Improve chatbot intelligence using ML models.

## **🤝 Contributing**
Feel free to submit pull requests and report issues to enhance the project!

## **📞 Contact**
For queries, email: support@curabot.com

