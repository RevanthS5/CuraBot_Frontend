import React, { useState, useEffect } from 'react';
import { scheduleAPI } from '../../services/api';
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
  const { } = useAuth();
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
        // Use getDoctorScheduleOverview which now handles getting the doctorId correctly
        const scheduleResponse = await scheduleAPI.getDoctorScheduleOverview();
        setSchedule(scheduleResponse.data);
      } catch (err: any) {
        console.error('Error fetching schedule:', err);
      }
    };

    fetchSchedule();
  }, []);

  const checkIfDateExists = (dateToCheck: string) => {
    if (!schedule || !schedule.availableSlots) return false;
    
    const formattedDate = new Date(dateToCheck).toISOString().split('T')[0];
    return schedule.availableSlots.some(slot => {
      const slotDate = new Date(slot.date).toISOString().split('T')[0];
      return slotDate === formattedDate;
    });
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const ampm = hours < 12 ? 'AM' : 'PM';
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Manage Your Schedule</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 bg-blue-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isUpdating ? 'Update Availability' : 'Set New Availability'}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Define your available time slots for patient appointments
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setIsUpdating(checkIfDateExists(e.target.value));
                    }}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    min={new Date().toISOString().split('T')[0]}
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
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value))}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    id="startTime"
                    name="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                    id="endTime"
                    name="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isUpdating ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isUpdating ? 'focus:ring-yellow-500' : 'focus:ring-blue-500'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isUpdating ? 'Update Availability' : 'Set Availability'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {schedule && schedule.availableSlots && schedule.availableSlots.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Scheduled Dates
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Click on a date to edit its availability
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {schedule.availableSlots
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((slot, index) => {
                  const slotDate = new Date(slot.date);
                  const isToday = new Date().toDateString() === slotDate.toDateString();
                  const isPast = slotDate < new Date();
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        isPast 
                          ? 'bg-gray-50 border-gray-200' 
                          : isToday 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-gray-200'
                      }`}
                      onClick={() => {
                        if (!isPast) {
                          const formattedDate = slotDate.toISOString().split('T')[0];
                          setDate(formattedDate);
                          setIsUpdating(true);
                          
                          // Find the first and last time slot to set start and end times
                          if (slot.times.length > 0) {
                            const sortedTimes = [...slot.times].sort((a, b) => 
                              a.time.localeCompare(b.time)
                            );
                            
                            const firstTime = sortedTimes[0].time;
                            const lastTimeIndex = sortedTimes.length - 1;
                            const lastTime = sortedTimes[lastTimeIndex].time;
                            
                            setStartTime(firstTime);
                            
                            // Calculate end time by adding interval to last time
                            const [hours, minutes] = lastTime.split(':').map(n => parseInt(n));
                            const lastTimeMinutes = hours * 60 + minutes + interval;
                            const endHours = Math.floor(lastTimeMinutes / 60);
                            const endMinutes = lastTimeMinutes % 60;
                            
                            setEndTime(`${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`);
                          }
                        }
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`font-medium ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                            {formatDate(slot.date)}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {slot.times.length} time slots
                          </p>
                        </div>
                        
                        <div>
                          {isPast ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Past
                            </span>
                          ) : isToday ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Today
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Time Range:</span> {formatTime(slot.times[0].time)} - {
                          formatTime(slot.times[slot.times.length - 1].time)
                        }
                      </div>
                      
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-green-600">
                          {slot.times.filter(t => !t.isBooked).length} Available
                        </span>
                        <span className="text-yellow-600">
                          {slot.times.filter(t => t.isBooked).length} Booked
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
