import { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialty?: string;
  };
  patientId: string;
  scheduleId: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  createdAt: string;
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

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

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'all') return true;
    
    if (activeTab === 'scheduled') {
      return appointment.status === 'pending';
    }
    
    if (activeTab === 'completed') {
      return new Date(appointment.date) < currentDate;
    }
    
    if (activeTab === 'cancelled') {
      return appointment.status === 'cancelled';
    }
    
    return false;
  });

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.cancelAppointment(appointmentId);
      // Update the local state
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      );
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment. Please try again later.');
    }
  };

  const getStatusIcon = (status: string, date: string) => {
    // Check if the appointment is in the past
    const isPast = new Date(date) < currentDate;
    
    if (status === 'pending' && !isPast) {
      return <Clock className="h-5 w-5 text-primary-500" />;
    } else if (isPast) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'cancelled') {
      return <XCircle className="h-5 w-5 text-gray-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string, date: string) => {
    // Check if the appointment is in the past
    const isPast = new Date(date) < currentDate;
    
    if (status === 'pending' && !isPast) {
      return 'Scheduled';
    } else if (isPast) {
      return 'Completed';
    } else if (status === 'cancelled') {
      return 'Cancelled';
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusClass = (status: string, date: string) => {
    // Check if the appointment is in the past
    const isPast = new Date(date) < currentDate;
    
    if (status === 'pending' && !isPast) {
      return 'bg-primary-50 text-primary-700 border-primary-200';
    } else if (isPast) {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (status === 'cancelled') {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <Button 
          variant="primary"
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scheduled'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cancelled'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'all' 
              ? "You don't have any appointments yet." 
              : `You don't have any ${activeTab} appointments.`}
          </p>
          <Button 
            variant="primary"
            to="/patient/appointments/book"
          >
            Book an Appointment
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(appointment.status, appointment.date)}`}>
                      {getStatusIcon(appointment.status, appointment.date)}
                      <span className="ml-1">{getStatusText(appointment.status, appointment.date)}</span>
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {appointment.time}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900">Dr. {appointment.doctorId?.name || 'Unknown'}</h3>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{appointment.doctorId?.specialty || 'Specialist'}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    to={`/patient/appointments/${appointment._id}`}
                  >
                    View Details
                  </Button>
                  
                  {appointment.status === 'pending' && new Date(appointment.date) > currentDate && (
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleCancelAppointment(appointment._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
