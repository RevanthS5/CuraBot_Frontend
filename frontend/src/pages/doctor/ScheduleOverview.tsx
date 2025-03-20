import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scheduleAPI } from '../../services/api';
import { Calendar, Clock, User, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        
        // Use the getDoctorScheduleOverview function which now handles getting the doctorId correctly
        const scheduleResponse = await scheduleAPI.getDoctorScheduleOverview();
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
      const response = await scheduleAPI.getAppointmentsByDate(formattedDate);
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

  if (!schedule || !schedule.availableSlots || schedule.availableSlots.length === 0) {
    return (
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
        >
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No schedule set</h3>
          <p className="mt-1 text-gray-500 max-w-md mx-auto">
            You haven't set your availability yet. Create your schedule to start accepting appointments.
          </p>
          <div className="mt-6">
            <Link
              to="/doctor/manage-schedule"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Set Availability
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary-500" />
          Schedule Overview
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
        className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <select
          id="date-select"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md transition-shadow"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
        >
          {sortedDates.map((slot) => (
            <option key={slot.date} value={slot.date}>
              {formatDate(slot.date)}
            </option>
          ))}
        </select>
      </motion.div>

      {selectedDateSlots && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
        >
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-500" />
              Schedule for {formatDate(selectedDate)}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {selectedDateSlots.times.length} time slots available
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {selectedDateSlots.times.map((slot, index) => {
                // Find if there's an appointment for this time slot
                const appointment = appointments.find(app => app.time === slot.time);
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className={`p-4 rounded-lg border shadow-sm transition-all hover:shadow-md ${
                      slot.isBooked 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                        : 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-medium">
                        {formatTime(slot.time)}
                      </h4>
                      <span 
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          slot.isBooked 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    
                    {appointment && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" />
                          <span className="font-medium">{appointment.patientId?.name || 'Unknown Patient'}</span>
                        </div>
                        
                        {appointment.patientId?.email && (
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <span>{appointment.patientId.email}</span>
                          </div>
                        )}
                        
                        <div className="mt-2 flex justify-end">
                          <Link
                            to={`/doctor/appointment/${appointment._id}`}
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                          >
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </div>
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
