import { useState, useEffect } from 'react';
import { scheduleAPI } from '../../services/api';
import { Calendar, Clock, Check, AlertCircle, CalendarPlus, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-primary-500" />
          Manage Your Schedule
        </h2>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-8"
      >
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-50 to-secondary-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <CalendarPlus className="h-5 w-5 mr-2 text-primary-500" />
            {isUpdating ? 'Update Availability' : 'Set New Availability'}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Define your available time slots for patient appointments
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-green-50 p-4 mb-4 border border-green-200"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{success}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md bg-red-50 p-4 mb-4 border border-red-200"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
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
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-shadow"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  Appointment Duration (minutes)
                </label>
                <div className="mt-1">
                  <select
                    id="interval"
                    name="interval"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value))}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-shadow"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  Start Time
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-shadow"
                    required
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  End Time
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md transition-shadow"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isUpdating 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700' 
                    : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CalendarPlus className="mr-1.5 h-4 w-4" />
                    <span>{isUpdating ? 'Update Availability' : 'Set Availability'}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
      
      {schedule && schedule.availableSlots && schedule.availableSlots.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
        >
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-500" />
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
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={`p-4 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        isPast 
                          ? 'bg-gray-50 border-gray-200' 
                          : isToday 
                            ? 'bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200' 
                            : 'bg-white border-gray-200 hover:border-primary-200'
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
                          <p className="text-sm text-gray-500 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {slot.times.length} time slots
                          </p>
                        </div>
                        
                        <div>
                          {isPast ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                              Past
                            </span>
                          ) : isToday ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 border border-primary-200">
                              Today
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="font-medium">Time Range:</span> {formatTime(slot.times[0].time)} - {
                          formatTime(slot.times[slot.times.length - 1].time)
                        }
                      </div>
                      
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          {slot.times.filter(t => !t.isBooked).length} Available
                        </span>
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {slot.times.filter(t => t.isBooked).length} Booked
                        </span>
                      </div>
                      
                      {!isPast && (
                        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                          <button className="text-xs text-primary-600 hover:text-primary-800 flex items-center transition-colors">
                            Edit Schedule
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
