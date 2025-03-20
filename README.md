# CuraBot - Healthcare Management System

CuraBot is a comprehensive healthcare management platform designed to streamline the interaction between patients and doctors. The application provides specialized dashboards for patients, doctors, and administrators, facilitating efficient healthcare service delivery.

## Features

### Patient Dashboard
- Schedule and manage appointments
- Access personal medical records
- Chat with healthcare providers
- View and update personal profile

### Doctor Dashboard
- Manage patient appointments
- Access patient medical records
- Update availability schedule
- Communicate with patients

### Admin Dashboard
- Monitor system statistics (Total Doctors, Total Patients, Today's Appointments)
- Manage doctor profiles (Add, Edit, Delete)
- View patient information
- Access AI-powered analytics for insights on:
  - Appointments by day
  - Distribution by specialization
  - Doctor performance metrics
  - Peak hours analysis

## Technology Stack

### Frontend
- React.js with nested routing architecture
- Recharts for data visualization
- Modern UI/UX design principles

### Backend
- Node.js/Express.js RESTful API
- MongoDB database
- JWT authentication
- AI integration for analytics and chatbot functionality

### AI Integration
- Integrated chatbot for patient assistance
- Advanced analytics for administrative insights

## API Structure

### Admin API Endpoints
- `/api/doctors/` - Get all doctors
- `/api/doctors/:id` - Get specific doctor details
- `/api/admin/patients` - Get all patients
- `/api/admin/doctors/add` - Add new doctor
- `/api/admin/update/:id` - Update doctor information
- `/api/admin/delete/:id` - Delete doctor
- `/api/admin/doctor-schedule/:doctorId` - Get doctor schedule
- `/api/admin/analytics?period=day|week` - Get AI-based analytics

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/CuraBot-Redefined.git
   cd CuraBot-Redefined
   ```

2. Install dependencies
   ```
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. Configure environment variables
   - Create a `.env` file in the root directory based on `.env.example`

4. Start the application
   ```
   # Start backend server
   npm run server
   
   # In a separate terminal, start frontend
   cd frontend
   npm run dev
   ```

## License

[MIT License](LICENSE)

## Contributors

- [Your Name](https://github.com/yourusername)
