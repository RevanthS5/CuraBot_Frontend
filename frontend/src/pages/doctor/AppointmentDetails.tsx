import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorAPI } from '../../services/api';
import { Calendar, Clock, User, Mail, ChevronLeft, AlertCircle, FileText, Activity, Clipboard, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface PatientSummary {
  patientName: string;
  symptoms: string[];
  possibleDiagnosis: string;
  additionalNotes: string;
}

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  time: string;
  status: string;
  reason: string;
}

export default function AppointmentDetails() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientSummary, setPatientSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) return;
      
      try {
        setLoading(true);
        
        // Fetch patient summary using the doctorAPI.getAppointmentDetails
        const response = await doctorAPI.getAppointmentDetails(appointmentId);
        setPatientSummary(response.data);
        
        // For now, we'll set a placeholder appointment since we're using the summary data
        // In a real app, you might want to fetch the actual appointment details separately
        setAppointment({
          _id: appointmentId,
          patientId: {
            _id: '1',
            name: response.data.patientName,
            email: 'patient@example.com' // This would come from a real API call
          },
          date: new Date().toISOString().split('T')[0], // Placeholder
          time: '10:00', // Placeholder
          status: 'pending', // Placeholder
          reason: 'Consultation' // Placeholder
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching patient data:', err);
        setError(err.response?.data?.message || 'Failed to fetch patient data');
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-secondary-500 animate-spin absolute top-2 left-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!patientSummary) {
    return (
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Patient summary not found</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link 
          to="/doctor/schedule" 
          className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Schedule
        </Link>
      </motion.div>

      {appointment && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-6"
        >
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-50 to-secondary-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-500" />
              Appointment Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-400" />
              {formatDate(appointment.date)} at {formatTime(appointment.time)}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  Patient Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                  {patientSummary.patientName}
                </dd>
              </div>
              {appointment.patientId?.email && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-400" />
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.patientId.email}
                  </dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1 text-gray-400" />
                  Status
                </dt>
                <dd className="mt-1 sm:mt-0 sm:col-span-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </dd>
              </div>
              {appointment.reason && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clipboard className="h-4 w-4 mr-1 text-gray-400" />
                    Reason for Visit
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.reason}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </motion.div>
      )}

      {/* Patient Summary Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
      >
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-500" />
            AI-Generated Patient Summary
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Generated based on patient's medical history and symptoms
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <div>
            <dl>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  Patient Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                  {patientSummary.patientName}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Activity className="h-4 w-4 mr-1 text-gray-400" />
                  Symptoms
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 overflow-hidden shadow-sm">
                    {patientSummary.symptoms.map((symptom, index) => (
                      <motion.li 
                        key={index} 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                        className="pl-3 pr-4 py-3 flex items-center justify-start text-sm bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 h-5 w-5 text-orange-500 mr-2">
                          <Activity className="h-5 w-5" />
                        </div>
                        <span className="ml-2 flex-1 w-0 truncate capitalize">{symptom}</span>
                      </motion.li>
                    ))}
                  </ul>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Clipboard className="h-4 w-4 mr-1 text-gray-400" />
                  Possible Diagnosis
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-md border border-yellow-200 shadow-sm">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700 font-medium">{patientSummary.possibleDiagnosis}</p>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                  Additional Notes
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p className="italic">{patientSummary.additionalNotes}</p>
                </dd>
              </div>
            </dl>
            
            <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <Clipboard className="mr-1.5 h-4 w-4" />
                  Add Notes
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Start Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
