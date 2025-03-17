import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { userAPI } from '../../services/api';
import Button from '../../components/Button';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await userAPI.getUserProfile();
        console.log('User profile:', response.data);
        setProfile(response.data.profile);
        setFormData(response.data.profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: keyof UserProfile, index: number, value: string) => {
    if (!formData) return;
    
    const updatedArray = [...(formData[field] as string[] || [])];
    updatedArray[index] = value;
    
    setFormData((prev) => ({ ...prev, [field]: updatedArray }));
  };

  const handleAddItem = (field: keyof UserProfile) => {
    if (!formData) return;
    
    const currentArray = [...(formData[field] as string[] || [])];
    currentArray.push('');
    
    setFormData((prev) => ({ ...prev, [field]: currentArray }));
  };

  const handleRemoveItem = (field: keyof UserProfile, index: number) => {
    if (!formData) return;
    
    const currentArray = [...(formData[field] as string[] || [])];
    currentArray.splice(index, 1);
    
    setFormData((prev) => ({ ...prev, [field]: currentArray }));
  };

  const handleEmergencyContactChange = (index: number, field: string, value: string) => {
    if (!formData || !formData.emergencyContacts) return;
    
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value
    };
    
    setFormData((prev) => ({ ...prev, emergencyContacts: updatedContacts }));
  };

  const handleAddEmergencyContact = () => {
    if (!formData) return;
    
    const newContact = {
      name: '',
      relationship: '',
      phone: ''
    };
    
    const currentContacts = [...(formData.emergencyContacts || [])];
    currentContacts.push(newContact);
    
    setFormData((prev) => ({ ...prev, emergencyContacts: currentContacts }));
  };

  const handleRemoveEmergencyContact = (index: number) => {
    if (!formData || !formData.emergencyContacts) return;
    
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts.splice(index, 1);
    
    setFormData((prev) => ({ ...prev, emergencyContacts: updatedContacts }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await userAPI.updateUserProfile(formData);
      console.log('Profile updated:', response.data);
      
      setProfile(response.data.profile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update your profile. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData?.name || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <span>{profile?.name}</span>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData?.email || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <span>{profile?.email}</span>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData?.phone || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-2" />
              <span>{profile?.phone}</span>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              name="dateOfBirth"
              value={formData?.dateOfBirth || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span>{new Date(profile?.dateOfBirth || '').toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          {isEditing ? (
            <select
              name="gender"
              value={formData?.gender || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          ) : (
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <span className="capitalize">{profile?.gender}</span>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
          {isEditing ? (
            <select
              name="bloodType"
              value={formData?.bloodType || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Blood Type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          ) : (
            <div className="flex items-center">
              <span className="h-5 w-5 flex items-center justify-center bg-red-100 text-red-800 rounded-full mr-2 text-xs font-bold">
                {profile?.bloodType}
              </span>
              <span>Blood Type {profile?.bloodType}</span>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        {isEditing ? (
          <textarea
            name="address"
            value={formData?.address || ''}
            onChange={handleChange}
            rows={2}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        ) : (
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <span>{profile?.address}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Allergies</h3>
        {isEditing ? (
          <div className="space-y-2">
            {formData?.allergies?.map((allergy, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={allergy}
                  onChange={(e) => handleArrayChange('allergies', index, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('allergies', index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem('allergies')}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              + Add Allergy
            </button>
          </div>
        ) : (
          <div>
            {profile?.allergies?.length ? (
              <ul className="list-disc pl-5 space-y-1">
                {profile.allergies.map((allergy, index) => (
                  <li key={index}>{allergy}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No allergies recorded</p>
            )}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Current Medications</h3>
        {isEditing ? (
          <div className="space-y-2">
            {formData?.medications?.map((medication, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => handleArrayChange('medications', index, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('medications', index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem('medications')}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              + Add Medication
            </button>
          </div>
        ) : (
          <div>
            {profile?.medications?.length ? (
              <ul className="list-disc pl-5 space-y-1">
                {profile.medications.map((medication, index) => (
                  <li key={index}>{medication}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No medications recorded</p>
            )}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Medical Conditions</h3>
        {isEditing ? (
          <div className="space-y-2">
            {formData?.medicalConditions?.map((condition, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => handleArrayChange('medicalConditions', index, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem('medicalConditions', index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem('medicalConditions')}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              + Add Medical Condition
            </button>
          </div>
        ) : (
          <div>
            {profile?.medicalConditions?.length ? (
              <ul className="list-disc pl-5 space-y-1">
                {profile.medicalConditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No medical conditions recorded</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Contacts</h3>
      
      {isEditing ? (
        <div className="space-y-6">
          {formData?.emergencyContacts?.map((contact, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Contact #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveEmergencyContact(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={contact.relationship}
                    onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddEmergencyContact}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            + Add Emergency Contact
          </button>
        </div>
      ) : (
        <div>
          {profile?.emergencyContacts?.length ? (
            <div className="space-y-4">
              {profile.emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({contact.relationship})</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No emergency contacts recorded</p>
          )}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {isEditing ? (
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setFormData(profile || {});
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSaving}
            >
              Save Changes
            </Button>
          </div>
        ) : (
          <Button 
            variant="primary"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
          <p className="mt-1 text-sm text-gray-500">Your basic personal and contact information.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {renderPersonalInfo()}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Medical Information</h2>
          <p className="mt-1 text-sm text-gray-500">Your medical history, allergies, and current medications.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {renderMedicalInfo()}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Emergency Contacts</h2>
          <p className="mt-1 text-sm text-gray-500">People to contact in case of emergency.</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {renderEmergencyContacts()}
        </div>
      </div>
    </div>
  );
}
