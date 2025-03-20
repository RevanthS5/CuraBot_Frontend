import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { adminAPI, doctorAPI } from '../../services/api';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate('/admin/doctors')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Doctors
        </button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          Doctor not found.
        </div>
        <button
          onClick={() => navigate('/admin/doctors')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/doctors')}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Doctor Details</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          {doctor.profilePic && (
            <div className="mb-6 flex justify-center">
              <img 
                src={doctor.profilePic} 
                alt={doctor.name} 
                className="h-48 w-48 object-cover rounded-full border-4 border-gray-200"
              />
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                <input
                  type="text"
                  name="profilePic"
                  value={formData.profilePic}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                <input
                  type="text"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {doctor.expertise && doctor.expertise.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    {doctor.expertise.map((item, index) => (
                      <div key={index} className="mb-2 text-sm text-gray-700">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                  {doctor.userId}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
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

      {/* Doctor Schedule Section */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Doctor Schedule</h3>
        </div>
        
        {isScheduleLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : schedule.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">No schedule information available for this doctor.</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.map((day) => (
                <div key={day._id} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h4>
                  <div className="space-y-2">
                    {day.slots.map((slot, index) => (
                      <div 
                        key={index}
                        className={`text-sm py-1 px-2 rounded ${
                          slot.isBooked 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {slot.time} - {slot.isBooked ? 'Booked' : 'Available'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
