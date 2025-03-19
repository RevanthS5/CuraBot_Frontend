import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../../services/api';

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
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) return;
      
      try {
        setLoading(true);
        const response = await appointmentAPI.getAppointmentDetails(appointmentId);
        setAppointment(response.data);
        setLoading(false);
        
        // Fetch patient summary after getting appointment details
        fetchPatientSummary(appointmentId);
      } catch (err: any) {
        console.error('Error fetching appointment details:', err);
        setError(err.response?.data?.message || 'Failed to fetch appointment details');
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchPatientSummary = async (id: string) => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const response = await doctorAPI.getPatientSummary(id);
      setPatientSummary(response.data);
      setSummaryLoading(false);
    } catch (err: any) {
      console.error('Error fetching patient summary:', err);
      setSummaryError(err.response?.data?.message || 'Failed to fetch patient summary');
      setSummaryLoading(false);
    }
  };

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
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointment found</h3>
          <p className="mt-1 text-sm text-gray-500">The appointment you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/doctor" className="text-blue-600 hover:text-blue-900 flex items-center">
          <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Appointments
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Appointment Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the appointment and patient.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Patient name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{appointment.patientId.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{appointment.patientId.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(appointment.date)}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatTime(appointment.time)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : appointment.status === 'cancelled' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Reason for visit</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{appointment.reason}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Patient AI Summary</h3>
        
        {summaryLoading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-center mt-2 text-sm text-gray-500">Generating patient summary...</p>
          </div>
        ) : summaryError ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{summaryError}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => fetchPatientSummary(appointmentId || '')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : patientSummary ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Patient</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientSummary.patientName}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Symptoms</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {patientSummary.symptoms.map((symptom, index) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">{symptom}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Possible Diagnosis</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientSummary.possibleDiagnosis}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientSummary.additionalNotes}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patient summary available</h3>
              <p className="mt-1 text-sm text-gray-500">The patient hasn't interacted with the chatbot yet.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => fetchPatientSummary(appointmentId || '')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Generate Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
