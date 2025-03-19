import React, { useState, useEffect } from 'react';
import { scheduleAPI, doctorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Schedule {
  _id: string;
  doctorId: string;
  availableSlots: {
    date: string;
    times: {
      time: string;
      isBooked: boolean;
    }[];
  }[];
}

export default function ManageSchedule() {
  const { user } = useAuth();
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [interval, setInterval] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const doctorResponse = await doctorAPI.getDoctorProfile();
        const doctorId = doctorResponse.data._id;
        
        const scheduleResponse = await scheduleAPI.getDoctorAvailability(doctorId);
        setSchedule(scheduleResponse.data);
      } catch (err: any) {
        console.error('Error fetching schedule:', err);
      }
    };

    fetchSchedule();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      setError('Please select a date');
      return;
    }

    if (new Date(date) < new Date()) {
      setError('Cannot set availability for past dates');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const scheduleData = {
        date,
        startTime,
        endTime,
        interval
      };

      let response;
      
      if (isUpdating) {
        response = await scheduleAPI.updateDoctorAvailability(scheduleData);
        setSuccess('Schedule updated successfully');
      } else {
        response = await scheduleAPI.setDoctorAvailability(scheduleData);
        setSuccess('Schedule set successfully');
      }

      setSchedule(response.data.schedule);
      setLoading(false);
    } catch (err: any) {
      console.error('Error setting schedule:', err);
      setError(err.response?.data?.message || 'Failed to set schedule');
      setLoading(false);
    }
  };

  const checkIfDateExists = (selectedDate: string) => {
    if (!schedule || !schedule.availableSlots) return false;
    
    return schedule.availableSlots.some(slot => 
      new Date(slot.date).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0]
    );
  };

  const handleDateChange = (selectedDate: string) => {
    setDate(selectedDate);
    setIsUpdating(checkIfDateExists(selectedDate));
    
    // If the date already exists in the schedule, pre-fill the form with existing values
    if (schedule && schedule.availableSlots) {
      const existingSlot = schedule.availableSlots.find(slot => 
        new Date(slot.date).toISOString().split('T')[0] === new Date(selectedDate).toISOString().split('T')[0]
      );
      
      if (existingSlot && existingSlot.times.length > 0) {
        // Extract start and end times from the existing slot
        const times = existingSlot.times.map(t => t.time);
        const firstTime = times[0];
        const lastTime = times[times.length - 1];
        
        // Calculate interval based on the first two time slots
        if (times.length > 1) {
          const [firstHour, firstMinute] = firstTime.split(':').map(Number);
          const [secondHour, secondMinute] = times[1].split(':').map(Number);
          
          const firstTotalMinutes = firstHour * 60 + firstMinute;
          const secondTotalMinutes = secondHour * 60 + secondMinute;
          
          setInterval(secondTotalMinutes - firstTotalMinutes);
        }
        
        setStartTime(firstTime);
        
        // Calculate end time by adding interval to the last time
        const [lastHour, lastMinute] = lastTime.split(':').map(Number);
        const lastTotalMinutes = lastHour * 60 + lastMinute;
        const endTotalMinutes = lastTotalMinutes + interval;
        
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMinute = endTotalMinutes % 60;
        
        setEndTime(`${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`);
      }
    }
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

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Manage Schedule</h2>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="date"
                    id="date"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                  Appointment Duration (minutes)
                </label>
                <div className="mt-1">
                  <select
                    id="interval"
                    name="interval"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value))}
                    required
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="startTime"
                    id="startTime"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="endTime"
                    id="endTime"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
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
            )}

            {success && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : isUpdating ? 'Update Schedule' : 'Set Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {schedule && schedule.availableSlots && schedule.availableSlots.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Scheduled Dates</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[...schedule.availableSlots]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((slot) => (
                  <li key={slot.date}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {formatDate(slot.date)}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {slot.times.length} time slots
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {slot.times[0]?.time} - {slot.times[slot.times.length - 1]?.time}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleDateChange(slot.date)}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
