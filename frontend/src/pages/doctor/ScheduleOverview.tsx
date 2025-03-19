import React, { useState, useEffect } from 'react';
import { scheduleAPI, doctorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface TimeSlot {
  time: string;
  isBooked: boolean;
}

interface AvailableSlot {
  date: string;
  times: TimeSlot[];
}

interface Schedule {
  _id: string;
  doctorId: string;
  availableSlots: AvailableSlot[];
}

export default function ScheduleOverview() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const doctorResponse = await doctorAPI.getDoctorProfile();
        const doctorId = doctorResponse.data._id;
        
        const scheduleResponse = await scheduleAPI.getDoctorAvailability(doctorId);
        setSchedule(scheduleResponse.data);
        
        // Set the first available date as selected by default
        if (scheduleResponse.data?.availableSlots?.length > 0) {
          const sortedDates = [...scheduleResponse.data.availableSlots].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          // Find the first date that is today or in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const upcomingDate = sortedDates.find(slot => 
            new Date(slot.date).getTime() >= today.getTime()
          );
          
          if (upcomingDate) {
            setSelectedDate(upcomingDate.date);
            fetchAppointmentsForDate(upcomingDate.date);
          } else if (sortedDates.length > 0) {
            setSelectedDate(sortedDates[0].date);
            fetchAppointmentsForDate(sortedDates[0].date);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching schedule:', err);
        setError(err.response?.data?.message || 'Failed to fetch schedule');
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const fetchAppointmentsForDate = async (date: string) => {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await doctorAPI.getAppointmentsByDate(formattedDate);
      setAppointments(response.data);
    } catch (err: any) {
      console.error('Error fetching appointments for date:', err);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchAppointmentsForDate(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  if (!schedule || !schedule.availableSlots || schedule.availableSlots.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule set</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't set your availability yet.</p>
          <div className="mt-6">
            <a
              href="/doctor/manage-schedule"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Set Availability
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Sort dates for display
  const sortedDates = [...schedule.availableSlots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Find the selected date's slots
  const selectedDateSlots = schedule.availableSlots.find(
    slot => new Date(slot.date).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0]
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Schedule Overview</h2>
      
      <div className="mb-6">
        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <select
          id="date-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
        >
          {sortedDates.map((slot) => (
            <option key={slot.date} value={slot.date}>
              {formatDate(slot.date)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {selectedDateSlots?.times.map((slot, index) => {
            // Find if there's an appointment for this time slot
            const appointment = appointments.find(app => app.time === slot.time);
            
            return (
              <li key={index}>
                <div className={`px-4 py-4 sm:px-6 ${slot.isBooked ? 'bg-gray-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {formatTime(slot.time)}
                      </p>
                    </div>
                    <div>
                      {slot.isBooked ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Booked
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {appointment && (
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {appointment.patientId.name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {appointment.reason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
