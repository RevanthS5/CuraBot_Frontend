# **CuraBot Backend API Documentation**

## **📌 Overview**
This document provides a detailed list of all the backend APIs categorized by functionality. It serves as a reference for testing and integration.

---

## **🔥 1. Authentication & User Management**
📍 **File:** `routes/authRoutes.js`
📍 **Purpose:** Handles user authentication (Patients, Doctors, Admins).

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new user (Patient, Doctor, Admin) | Public |
| `POST` | `/api/auth/login` | Login and get JWT token | Public |
| `GET` | `/api/auth/me` | Get logged-in user details (JWT protected) | Protected (All Users) |
| `GET` | `/api/users/profile/:userId` | Get user profile details | Protected (User) |
| `PATCH` | `/api/users/update/:userId` | Update user profile | Protected (User) |
| `DELETE` | `/api/users/delete/:userId` | Delete a user account | Protected (Admin) |

---

## **🔥 2. AI Chatbot (Groq API Integration)**
📍 **File:** `routes/chatbotRoutes.js`
📍 **Purpose:** AI chatbot for symptom assessment and doctor recommendations.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `POST` | `/api/chatbot/query` | AI-based symptom analysis | Public |
| `GET` | `/api/chatbot/history/:userId` | Retrieve chat history for a user | Protected (Patients) |

---

## **🔥 3. Doctor Management**
📍 **File:** `routes/doctorRoutes.js`
📍 **Purpose:** CRUD operations for doctors and managing availability.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `POST` | `/api/doctors/add` | Add a new doctor | Protected (Admin) |
| `GET` | `/api/doctors/all` | Get all doctors | Public |
| `GET` | `/api/doctors/:doctorId` | Get a specific doctor’s details | Public |
| `GET` | `/api/doctors/specialty/:specialization` | Get doctors by specialization | Public |
| `PATCH` | `/api/doctors/update/:doctorId` | Update doctor details | Protected (Admin) |
| `DELETE` | `/api/doctors/delete/:doctorId` | Remove a doctor from the system | Protected (Admin) |

---

## **🔥 4. Appointment Management**
📍 **File:** `routes/appointmentRoutes.js`
📍 **Purpose:** Handles booking, rescheduling, and retrieving appointments.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `POST` | `/api/appointments/book` | Book an appointment with a doctor | Protected (Patients) |
| `GET` | `/api/appointments/:appointmentId` | Get details of a specific appointment | Protected (Patients, Doctors, Admins) |
| `GET` | `/api/appointments/user/:userId` | Get all appointments for a user | Protected (Patients) |
| `GET` | `/api/appointments/doctor/:doctorId` | Get all appointments for a doctor | Protected (Doctors) |
| `PATCH` | `/api/appointments/reschedule/:appointmentId` | Reschedule an appointment | Protected (Patients, Admins) |
| `PATCH` | `/api/appointments/cancel/:appointmentId` | Cancel an appointment | Protected (Patients, Admins) |
| `PATCH` | `/api/appointments/complete/:appointmentId` | Mark appointment as completed | Protected (Doctors) |

---

## **🔥 5. SMS Notifications (Twilio API)**
📍 **File:** `routes/notificationRoutes.js`
📍 **Purpose:** Send appointment confirmation and reminders via SMS.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `POST` | `/api/notifications/send` | Send SMS for appointment confirmation | Protected (System, Admin) |
| `POST` | `/api/notifications/reminder` | Send SMS reminder before the appointment | Protected (System) |

---

## **🔥 6. Admin Management & Analytics**
📍 **File:** `routes/adminRoutes.js`
📍 **Purpose:** Admin controls for user management and analytics.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `GET` | `/api/admin/analytics` | Get hospital analytics (patient flow, peak hours) | Protected (Admin) |
| `GET` | `/api/admin/appointments` | View all appointments in the hospital | Protected (Admin) |
| `GET` | `/api/admin/doctors` | View all registered doctors | Protected (Admin) |
| `PATCH` | `/api/admin/update-user/:userId` | Update user roles (e.g., make a doctor/admin) | Protected (Admin) |

---

## **🔥 7. General Health & System Status**
📍 **File:** `routes/systemRoutes.js`
📍 **Purpose:** Check system health and uptime.

| Method | Endpoint | Description | Access |
|--------|---------|-------------|--------|
| `GET` | `/api/health` | Check if the API is running | Public |

---

## **📌 Total Number of APIs**
Total **28** API Endpoints categorized as follows:

| Category | Total APIs |
|----------|-----------|
| **Authentication & User Management** | 6 |
| **AI Chatbot (Groq API)** | 2 |
| **Doctor Management** | 6 |
| **Appointment Management** | 7 |
| **SMS Notifications (Twilio API)** | 2 |
| **Admin Management & Analytics** | 4 |
| **System Status** | 1 |

---

## **🚀 How to Test APIs**
1. **Start the server**: `npm run dev`
2. **Use Postman or cURL** to test each API.
3. **Ensure you include JWT tokens** for protected routes.

Would you like a **Postman collection for testing all APIs?** 🔥

