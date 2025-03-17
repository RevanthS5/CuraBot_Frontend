import { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { Calendar, FileText, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import PatientAppointments from './Appointments';
import BookAppointment from './BookAppointment';
import MedicalRecords from './MedicalRecords';
import Profile from './Profile';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <Button 
          variant="primary"
          as={Link}
          to="/patient/appointments/book"
        >
          Book New Appointment
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-50 border-l-4 border-primary-500">
          <div className="flex items-center">
            <Calendar className="h-10 w-10 text-primary-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Scheduled</h3>
              <p className="text-2xl font-bold text-primary-600">{pendingCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center">
            <FileText className="h-10 w-10 text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gray-50 border-l-4 border-gray-500">
          <div className="flex items-center">
            <AlertCircle className="h-10 w-10 text-gray-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Cancelled</h3>
              <p className="text-2xl font-bold text-gray-600">{cancelledCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Next Appointment</h2>
            <Link to="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : upcomingAppointment ? (
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-primary-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {new Date(upcomingAppointment.date).toLocaleDateString()} at {upcomingAppointment.time}
                </span>
              </div>
              <h3 className="font-medium text-gray-900">Dr. {upcomingAppointment.doctorId?.name || 'Unknown'}</h3>
              <p className="text-gray-600 text-sm">{upcomingAppointment.doctorId?.specialization || 'Specialist'}</p>
              <div className="mt-4 flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  as={Link}
                  to={`/patient/appointments/${upcomingAppointment._id}`}
                >
                  View Details
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => {
                    // Handle cancellation
                    console.log('Cancel appointment:', upcomingAppointment._id);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">No upcoming appointments</p>
              <Button 
                variant="primary"
                size="sm"
                as={Link}
                to="/patient/appointments/book"
              >
                Book an Appointment
              </Button>
            </div>
          )}
        </Card>

        {/* Health Assistant */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">AI Health Assistant</h2>
            <Link to="/patient/assistant" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Open Chat
            </Link>
          </div>
          
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-primary-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">Chat with our AI to discuss your symptoms</p>
            <Button 
              variant="primary"
              size="sm"
              as={Link}
              to="/patient/assistant"
            >
              Start Conversation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}