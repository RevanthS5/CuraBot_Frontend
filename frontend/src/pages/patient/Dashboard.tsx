import { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { Calendar, FileText, MessageSquare, Clock, AlertCircle, ChevronRight, Activity, Bell, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import PatientAppointments from './Appointments';
import BookAppointment from './BookAppointment';
import MedicalRecords from './MedicalRecords';
import Profile from './Profile';
import Assistant from './Assistant';
import { motion } from 'framer-motion';

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialization?: string;
  };
  patientId: string;
  scheduleId: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

export default function PatientDashboard() {
  return (
    <Routes>
      <Route path="/" element={<PatientHome />} />
      <Route path="/appointments" element={<PatientAppointments />} />
      <Route path="/appointments/book" element={<BookAppointment />} />
      <Route path="/medical-records" element={<MedicalRecords />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/assistant" element={<Assistant />} />
    </Routes>
  );
}

function PatientHome() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await appointmentAPI.getPatientAppointments();
        console.log('Patient appointments:', response.data);
        
        if (isMounted) {
          // Check if response.data is an array directly or if it's nested
          const appointmentsData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.appointments || []);
          
          setAppointments(appointmentsData);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted && err.name !== 'AbortError') {
          console.error('Error fetching appointments:', err);
          setError('Failed to load appointments. Please try again later.');
          setIsLoading(false);
        }
      }
    };

    fetchAppointments();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Get the current date for comparison
  const currentDate = new Date();
  
  // Get the next upcoming appointment (status is pending and date is in the future)
  const upcomingAppointment = appointments.find(
    (apt) => apt.status === 'pending' && new Date(apt.date) > currentDate
  );

  // Count appointments by status
  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  
  // Completed appointments are those with dates in the past
  const completedCount = appointments.filter(
    apt => new Date(apt.date) < currentDate
  ).length;
  
  const cancelledCount = appointments.filter(apt => apt.status === 'cancelled').length;

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              {getGreeting()}, {user?.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/patient/appointments/book"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book New Appointment
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm" 
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1">{error}</p>
        </motion.div>
      )}

      {/* Health Overview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 text-primary-500 mr-2" />
          Health Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-primary-100 rounded-full p-3 mr-4">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Scheduled</h3>
                  <p className="text-3xl font-bold text-primary-600">{pendingCount}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-1 bg-gradient-to-r from-gray-500 to-gray-600"></div>
            <div className="p-6">
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full p-3 mr-4">
                  <AlertCircle className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Cancelled</h3>
                  <p className="text-3xl font-bold text-gray-600">{cancelledCount}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Appointment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Clock className="h-5 w-5 text-primary-500 mr-2" />
                Next Appointment
              </h2>
              <Link to="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : upcomingAppointment ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center mb-3">
                  <div className="bg-primary-100 rounded-full p-2 mr-3">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {formatDate(upcomingAppointment.date)} at {upcomingAppointment.time}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Dr. {upcomingAppointment.doctorId?.name || 'Unknown'}</h3>
                <p className="text-primary-600 text-sm font-medium">{upcomingAppointment.doctorId?.specialization || 'Specialist'}</p>
                
                <div className="mt-5 flex space-x-3">
                  <Link
                    to={`/patient/appointments/${upcomingAppointment._id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 transition-all"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                  <button
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-all"
                    onClick={() => {
                      // Handle cancellation
                      console.log('Cancel appointment:', upcomingAppointment._id);
                    }}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-8 border border-gray-100 text-center"
              >
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-6">No upcoming appointments</p>
                <Link
                  to="/patient/appointments/book"
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
                >
                  Book an Appointment
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Health Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <MessageSquare className="h-5 w-5 text-primary-500 mr-2" />
                AI Health Assistant
              </h2>
              <Link to="/patient/assistant" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                Open Chat
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-primary-50 to-white rounded-xl p-8 border border-primary-100 text-center"
            >
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">24/7 Health Support</h3>
              <p className="text-gray-600 mb-6">Chat with our AI to discuss your symptoms and get personalized health recommendations</p>
              <Link
                to="/patient/assistant"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Conversation
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Health Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-md overflow-hidden p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Shield className="h-5 w-5 text-primary-500 mr-2" />
            Health Tips & Reminders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-100"
          >
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-3 mr-4 mt-1">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Medication Reminder</h3>
                <p className="text-gray-600">Remember to take your medications as prescribed by your doctor for optimal health outcomes.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-gradient-to-r from-green-50 to-white rounded-xl p-5 border border-green-100"
          >
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-3 mr-4 mt-1">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Wellness Tip</h3>
                <p className="text-gray-600">Aim for at least 30 minutes of moderate physical activity daily to improve your overall health.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}