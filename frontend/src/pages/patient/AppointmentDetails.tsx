import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag, AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { appointmentAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AppointmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await appointmentAPI.getAppointmentDetails(id);
        console.log('Appointment details:', response.data);
        setAppointment(response.data.appointment);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Failed to load appointment details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id]);

  const handleCancelAppointment = async () => {
    if (!id) return;
    
    try {
      setIsCancelling(true);
      await appointmentAPI.cancelAppointment(id);
      
      // Update local state
      if (appointment) {
        setAppointment({
          ...appointment,
          status: 'cancelled'
        });
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Failed to cancel appointment. Please try again later.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-5 w-5 text-primary-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isUpcoming = appointment && 
    appointment.status === 'scheduled' && 
    new Date(`${appointment.date}T${appointment.time}`) > new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          to="/patient/appointments"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Appointments
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !appointment ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Appointment not found</h3>
          <p className="text-gray-500 mb-6">
            The appointment you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button 
            variant="primary"
            to="/patient/appointments"
          >
            View All Appointments
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                <span className="ml-1">{getStatusText(appointment.status)}</span>
              </div>
              
              {isUpcoming && (
                <Button 
                  variant="danger"
                  size="sm"
                  onClick={handleCancelAppointment}
                  isLoading={isCancelling}
                >
                  Cancel Appointment
                </Button>
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Doctor</h3>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-900">Dr. {appointment.doctorName}</p>
                    <p className="text-sm text-gray-500">{appointment.specialization}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Schedule</h3>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-base text-gray-900">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-base text-gray-900">{appointment.time}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Reason for Visit</h3>
              <p className="text-base text-gray-900 bg-gray-50 p-4 rounded-md">
                {appointment.reason}
              </p>
            </div>
            
            {appointment.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Doctor's Notes</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-base text-gray-900">{appointment.notes}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span>Appointment ID: </span>
                  <span className="font-mono">{appointment.id}</span>
                </div>
                <div>
                  <span>Created: </span>
                  <span>{new Date(appointment.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
          
          {appointment.status === 'scheduled' && (
            <div className="flex justify-end">
              <Button 
                variant="outline"
                to={`/patient/appointments/${appointment.id}/reschedule`}
              >
                Reschedule Appointment
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
