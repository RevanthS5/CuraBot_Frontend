import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User, Award, Briefcase, FileText, Clock, CheckCircle, X } from 'lucide-react';
import { adminAPI, doctorAPI } from '../../services/api';
import { motion } from 'framer-motion';

interface Doctor {
  _id: string;
  userId: string;
  name: string;
  profilePic?: string;
  speciality: string;
  qualification: string;
  overview: string;
  expertise: string[];
  createdAt: string;
}

interface Schedule {
  _id: string;
  doctorId: string;
  date: string;
  slots: {
    time: string;
    isBooked: boolean;
  }[];
}

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for editing doctor
  const [formData, setFormData] = useState({
    name: '',
    speciality: '',
    qualification: '',
    overview: '',
    profilePic: '',
  });

  useEffect(() => {
    if (!id) return;
    
    const fetchDoctorDetails = async () => {
      try {
        setIsLoading(true);
        // Here we're using the userId to fetch doctor details
        const response = await doctorAPI.getDoctorById(id);
        setDoctor(response.data);
        
        // Initialize form data
        setFormData({
          name: response.data.name || '',
          speciality: response.data.speciality || '',
          qualification: response.data.qualification || '',
          overview: response.data.overview || '',
          profilePic: response.data.profilePic || '',
        });
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to load doctor details. Please try again later.');
        setIsLoading(false);
      }
    };

    const fetchDoctorSchedule = async () => {
      try {
        setIsScheduleLoading(true);
        const response = await adminAPI.getDoctorSchedule(id);
        setSchedule(response.data);
        setIsScheduleLoading(false);
      } catch (err: any) {
        console.error('Error fetching doctor schedule:', err);
        setIsScheduleLoading(false);
      }
    };

    fetchDoctorDetails();
    fetchDoctorSchedule();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !doctor) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const updateData = {
        name: formData.name,
        speciality: formData.speciality,
        qualification: formData.qualification,
        overview: formData.overview,
        profilePic: formData.profilePic,
      };
      
      // Use doctorAPI instead of adminAPI for updating doctor details
      await doctorAPI.updateDoctor(id, updateData);
      
      setSuccessMessage('Doctor information updated successfully');
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating doctor:', err);
      setError('Failed to update doctor information. Please try again.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" 
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/admin/doctors')}
          className="mt-4 flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Doctors
        </motion.button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500"
        >
          Doctor not found.
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/admin/doctors')}
          className="mt-4 flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Doctors
        </motion.button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-6"
      >
        <button
          onClick={() => navigate('/admin/doctors')}
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <User className="h-5 w-5 mr-2 text-primary-500" />
          Doctor Details
        </h2>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4" 
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      )}

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative mb-4" 
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              {doctor.profilePic && (
                <div className="mb-6 flex justify-center">
                  <img 
                    src={doctor.profilePic} 
                    alt={doctor.name} 
                    className="h-32 w-32 rounded-full object-cover border-4 border-primary-100 shadow-md"
                  />
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 flex items-center">
                      <Award className="h-4 w-4 mr-1 text-gray-400" />
                      Speciality
                    </label>
                    <input
                      type="text"
                      id="speciality"
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 flex items-center">
                    <Briefcase className="h-4 w-4 mr-1 text-gray-400" />
                    Qualification
                  </label>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-gray-400" />
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    id="profilePic"
                    name="profilePic"
                    value={formData.profilePic}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label htmlFor="overview" className="block text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-gray-400" />
                    Overview
                  </label>
                  <textarea
                    id="overview"
                    name="overview"
                    rows={4}
                    value={formData.overview}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary-500" />
                Upcoming Schedule
              </h3>
            </div>
            
            <div className="p-4">
              {isScheduleLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : schedule.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No scheduled appointments found.
                </div>
              ) : (
                <div className="space-y-4">
                  {schedule
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 3) // Show only the next 3 dates
                    .map((scheduleItem) => (
                      <motion.div 
                        key={scheduleItem._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-gray-200 rounded-md p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary-500 mr-2" />
                            <span className="font-medium text-gray-800">
                              {new Date(scheduleItem.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                            {scheduleItem.slots.length} slots
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {scheduleItem.slots.slice(0, 6).map((slot, index) => (
                            <div 
                              key={index}
                              className={`text-xs px-2 py-1 rounded-md flex items-center justify-center ${
                                slot.isBooked 
                                  ? 'bg-red-100 text-red-800 border border-red-200' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}
                            >
                              {slot.isBooked ? (
                                <X className="h-3 w-3 mr-1" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              {slot.time}
                            </div>
                          ))}
                          
                          {scheduleItem.slots.length > 6 && (
                            <div className="text-xs px-2 py-1 rounded-md flex items-center justify-center bg-gray-100 text-gray-800 border border-gray-200">
                              +{scheduleItem.slots.length - 6} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                  <div className="text-center pt-2">
                    <button className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">
                      View Full Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mt-6"
          >
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-secondary-500" />
                Account Information
              </h3>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Doctor ID:</span>
                  <span className="text-sm font-medium text-gray-800">{doctor._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">User ID:</span>
                  <span className="text-sm font-medium text-gray-800">{doctor.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(doctor.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Expertise:</span>
                  <div className="text-right">
                    {doctor.expertise && doctor.expertise.length > 0 ? (
                      doctor.expertise.map((exp, index) => (
                        <span key={index} className="text-sm font-medium text-gray-800 block">
                          {exp}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
