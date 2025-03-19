import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorAPI } from '../../services/api';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patientSummary) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 m-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Patient summary not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/doctor/schedule" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Schedule
        </Link>
      </div>

      {appointment && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-blue-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Appointment Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {formatDate(appointment.date)} at {formatTime(appointment.time)}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Patient Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {patientSummary.patientName}
                </dd>
              </div>
              {appointment.patientId?.email && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.patientId.email}
                  </dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    appointment.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </dd>
              </div>
              {appointment.reason && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Reason for Visit</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment.reason}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Patient Summary Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-indigo-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
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
                <dt className="text-sm font-medium text-gray-500">Patient Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {patientSummary.patientName}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Symptoms</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {patientSummary.symptoms.map((symptom, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                        <svg className="flex-shrink-0 h-5 w-5 text-orange-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 013-1h6a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 013-1h7z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate capitalize">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Possible Diagnosis</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="p-4 bg-yellow-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">{patientSummary.possibleDiagnosis}</p>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p className="italic">{patientSummary.additionalNotes}</p>
                </dd>
              </div>
            </dl>
            
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Notes
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
