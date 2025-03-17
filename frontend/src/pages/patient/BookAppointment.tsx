import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MapPin } from 'lucide-react';
import { doctorAPI, appointmentAPI, scheduleAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

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

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [specialties, setSpecialties] = useState<string[]>([]);
  
  const { values, handleChange } = useForm({
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
        
        // Extract unique specialties from doctors data
        const uniqueSpecialties = Array.from(
          new Set(doctorsData.map((doctor: Doctor) => doctor.specialty))
        ).filter(Boolean) as string[];
        
        setSpecialties(uniqueSpecialties);
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
    // Filter doctors based on search term and specialty
    const filtered = doctors.filter(doctor => {
      const matchesSearch = 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = specialtyFilter ? doctor.specialty === specialtyFilter : true;
      
      return matchesSearch && matchesSpecialty;
    });
    
    setFilteredDoctors(filtered);
  }, [searchTerm, specialtyFilter, doctors]);

  const fetchAvailableTimes = async (doctorId: string, date: string) => {
    try {
      setIsLoading(true);
      // Use the scheduleAPI instead of doctorAPI for availability
      const response = await scheduleAPI.getDoctorAvailability(doctorId);
      console.log('Available times:', response.data);
      
      // Simulate available times
      const times = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
      ];
      
      setAvailableTimes(times);
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
    await fetchAvailableTimes(doctor._id, values.date);
    setStep(2);
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    
    if (selectedDoctor) {
      await fetchAvailableTimes(selectedDoctor._id, e.target.value);
    }
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

  const renderDoctorSelection = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <select
            className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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

  const renderTimeSelection = () => (
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
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Available Time Slots
        </label>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : availableTimes.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">No available time slots for the selected date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                type="button"
                className={`py-2 px-3 rounded-md text-sm font-medium ${
                  selectedTime === time
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
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
          placeholder="Please describe your symptoms or reason for the appointment"
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!selectedTime}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
        <Button 
          variant="outline" 
          size="sm"
          to="/patient/appointments"
        >
          View My Appointments
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {step === 1 ? renderDoctorSelection() : renderTimeSelection()}
    </div>
  );
}
