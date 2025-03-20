import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Calendar, Clock, ChevronLeft, CheckCircle, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { doctorAPI, appointmentAPI, scheduleAPI } from '../../services/api';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion } from 'framer-motion';

// Custom hook for form handling
const useForm = (initialValues: Record<string, any>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleChange
  };
};

// Updated Doctor interface to match the API response
interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification: string;
  overview: string;
  profilePic?: string;
  userId: string;
  expertise?: string[];
  createdAt: string;
}

// Interface for available time slots
interface TimeSlot {
  _id: string;
  time: string;
  isBooked: boolean;
}

// Interface for available schedule
interface AvailableSlot {
  date: string;
  times: TimeSlot[];
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const { values, setValues, handleChange } = useForm({
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // Get doctorId from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const doctorId = queryParams.get('doctorId');
    
    if (doctorId) {
      const selectDoctorFromId = async () => {
        try {
          setIsLoading(true);
          const response = await doctorAPI.getDoctorById(doctorId);
          const doctor = response.data;
          
          if (doctor) {
            setSelectedDoctor(doctor);
            await fetchAvailableTimes(doctor._id);
            setStep(2);
          }
        } catch (err) {
          console.error('Error fetching doctor by ID:', err);
          setError('Failed to load the selected doctor. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
      
      selectDoctorFromId();
    }
  }, [location.search]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await doctorAPI.getAllDoctors();
        console.log('Doctors:', response.data);
        
        // Check if response.data is an array directly or if it's nested
        const doctorsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.doctors || []);
        
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    // Filter doctors based on search term
    const filtered = doctors.filter(doctor => {
      return doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const fetchAvailableTimes = async (doctorId: string) => {
    try {
      setIsLoading(true);
      // Use the scheduleAPI to get doctor availability
      const response = await scheduleAPI.getDoctorAvailability(doctorId);
      console.log('Available times:', response.data);
      
      // Extract the available slots from the response
      let slots: AvailableSlot[] = [];
      
      if (response.data && response.data.availableSlots) {
        slots = response.data.availableSlots;
        
        // Filter out dates that are in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureDates = slots
          .filter(slot => {
            const slotDate = new Date(slot.date);
            return slotDate >= today;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setAvailableSlots(futureDates);
        
        // Extract available dates for the date picker
        const dates = futureDates.map(slot => {
          const date = new Date(slot.date);
          return date.toISOString().split('T')[0];
        });
        
        setAvailableDates(dates);
        
        // Set the default date to the first available date if there are any
        if (dates.length > 0) {
          setValues(prev => ({ ...prev, date: dates[0] }));
        }
      }
    } catch (err) {
      console.error('Error fetching available times:', err);
      setError('Failed to load available times. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTime(null);
    await fetchAvailableTimes(doctor._id);
    setStep(2);
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedTime || !values.date || !values.reason) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Format the appointment data according to backend expectations
      const appointmentData = {
        doctorId: selectedDoctor._id,
        date: values.date,
        time: selectedTime,
        reason: values.reason,
        // Add any additional fields required by the backend
        status: 'pending'
      };
      
      const response = await appointmentAPI.bookAppointment(appointmentData);
      console.log('Appointment booked:', response.data);
      
      // Redirect to appointments page
      navigate('/patient/appointments');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available time slots for the selected date
  const getAvailableTimesForSelectedDate = () => {
    if (!values.date) return [];
    
    const selectedSlot = availableSlots.find(slot => {
      const slotDate = new Date(slot.date);
      const formattedSlotDate = slotDate.toISOString().split('T')[0];
      return formattedSlotDate === values.date;
    });
    
    return selectedSlot ? selectedSlot.times : [];
  };

  const renderDoctorSelection = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search doctors by name..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500">
            {doctors.length === 0 
              ? "There are no doctors available at the moment." 
              : "No doctors match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doctor) => (
            <motion.div 
              key={doctor._id} 
              className="cursor-pointer"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => handleDoctorSelect(doctor)}
            >
              <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="p-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                <div className="p-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
                      {doctor.profilePic ? (
                        <img 
                          src={doctor.profilePic} 
                          alt={doctor.name} 
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-primary-600" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm font-medium text-primary-600 mb-1">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">{doctor.qualification}</p>
                      
                      {doctor.expertise && doctor.expertise.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {doctor.expertise.slice(0, 3).map((exp, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700"
                            >
                              {exp}
                            </span>
                          ))}
                          {doctor.expertise.length > 3 && (
                            <span className="text-xs text-gray-500">+{doctor.expertise.length - 3} more</span>
                          )}
                        </div>
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

  const renderTimeSelection = () => {
    const availableTimesForDate = getAvailableTimesForSelectedDate();
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {selectedDoctor && (
          <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
                {selectedDoctor.profilePic ? (
                  <img 
                    src={selectedDoctor.profilePic} 
                    alt={selectedDoctor.name} 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary-600" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-sm font-medium text-primary-600 mb-2">{selectedDoctor.specialty}</p>
                <button 
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Change Doctor
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            name="date"
            value={values.date}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {availableDates.length > 0 && (
            <div className="mt-2 flex items-center">
              <Calendar className="h-4 w-4 text-primary-500 mr-2" />
              <p className="text-xs text-gray-600">
                Available dates: {availableDates.map(date => {
                  const d = new Date(date);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }).join(', ')}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Time Slots
          </label>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="md" />
            </div>
          ) : availableTimesForDate.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No available time slots for the selected date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableTimesForDate.map((slot) => (
                <button
                  key={slot._id}
                  type="button"
                  disabled={slot.isBooked}
                  className={`relative py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    slot.isBooked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : selectedTime === slot.time
                        ? 'bg-primary-100 text-primary-700 border border-primary-300 shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !slot.isBooked && handleTimeSelect(slot.time)}
                >
                  {slot.time}
                  {selectedTime === slot.time && (
                    <CheckCircle className="absolute top-1 right-1 h-3 w-3 text-primary-600" />
                  )}
                  {slot.isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Visit
          </label>
          <textarea
            name="reason"
            value={values.reason}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Please describe your symptoms or reason for the appointment..."
          />
        </div>
        
        <div className="flex justify-between">
          <button 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all"
            onClick={() => setStep(1)}
            type="button"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          
          <button 
            type="submit" 
            disabled={!selectedTime || isSubmitting}
            className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transition-all shadow-md hover:shadow-lg ${
              (!selectedTime || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Book Appointment
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">Book an Appointment</h1>
        <button 
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all"
          onClick={() => navigate('/patient/appointments')}
        >
          View My Appointments
        </button>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm" 
          role="alert"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1">{error}</p>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit}>
        {step === 1 ? renderDoctorSelection() : renderTimeSelection()}
      </form>
    </motion.div>
  );
}
