import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MapPin } from 'lucide-react';
import { doctorAPI, appointmentAPI, scheduleAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

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
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search doctors by name..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor._id} 
              className="cursor-pointer" 
              onClick={() => handleDoctorSelect(doctor)}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    {doctor.profilePic ? (
                      <img 
                        src={doctor.profilePic} 
                        alt={doctor.name} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-primary-600">{doctor.specialty}</p>
                    <p className="text-sm text-gray-500 mt-1">{doctor.qualification}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTimeSelection = () => {
    const availableTimesForDate = getAvailableTimesForSelectedDate();
    
    return (
      <div className="space-y-6">
        {selectedDoctor && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                {selectedDoctor.profilePic ? (
                  <img 
                    src={selectedDoctor.profilePic} 
                    alt={selectedDoctor.name} 
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary-600" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-sm text-primary-600">{selectedDoctor.specialty}</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Change Doctor
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <p className="text-xs text-gray-500 mt-1">
              Available dates: {availableDates.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString();
              }).join(', ')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available Time Slots
          </label>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="md" />
            </div>
          ) : availableTimesForDate.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <p className="text-gray-500">No available time slots for the selected date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableTimesForDate.map((slot) => (
                <button
                  key={slot._id}
                  type="button"
                  disabled={slot.isBooked}
                  className={`py-2 px-3 rounded-md text-sm font-medium ${
                    slot.isBooked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : selectedTime === slot.time
                        ? 'bg-primary-100 text-primary-700 border border-primary-300'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !slot.isBooked && handleTimeSelect(slot.time)}
                >
                  {slot.time}
                  {slot.isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
          >
            Back
          </Button>
          
          <Button 
            type="submit" 
            disabled={!selectedTime || isSubmitting}
            isLoading={isSubmitting}
          >
            Book Appointment
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/patient/appointments')}
        >
          View My Appointments
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {step === 1 ? renderDoctorSelection() : renderTimeSelection()}
      </form>
    </div>
  );
}
