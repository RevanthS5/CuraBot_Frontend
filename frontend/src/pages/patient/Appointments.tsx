import { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, AlertCircle, CheckCircle, XCircle, Search, Plus } from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import Card from '../../components/Card';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">My Appointments</h1>
        <Link
          to="/patient/appointments/book"
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Book New Appointment
        </Link>
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'all' 
              ? "You don't have any appointments yet." 
              : `You don't have any ${activeTab} appointments.`}
          </p>
          <Link
            to="/patient/appointments/book"
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Book an Appointment
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="p-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(appointment.status, appointment.date)}`}>
                          {getStatusIcon(appointment.status, appointment.date)}
                          <span className="ml-1">{getStatusText(appointment.status, appointment.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Dr. {appointment.doctorId?.name || 'Unknown'}</h3>
                      
                      <div className="flex items-center text-sm text-primary-600">
                        <Tag className="h-4 w-4 mr-1" />
                        <span>{appointment.doctorId?.specialty || 'Specialist'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex space-x-3">
                      <Link
                        to={`/patient/appointments/${appointment._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 transition-all"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                      
                      {appointment.status === 'pending' && new Date(appointment.date) > currentDate && (
                        <button
                          className="inline-flex items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-all"
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
