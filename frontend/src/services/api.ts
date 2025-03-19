import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Update with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add a unique request ID to help identify duplicate requests
    config.headers['X-Request-ID'] = Date.now().toString() + Math.random().toString(36).substring(2, 15);
    
    console.log('API Request:', { 
      id: config.headers['X-Request-ID'],
      url: config.url, 
      method: config.method, 
      data: config.data,
      headers: config.headers 
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses and handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', { 
      id: response.config.headers['X-Request-ID'],
      url: response.config.url, 
      status: response.status, 
      data: response.data 
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', { 
      id: error.config?.headers?.['X-Request-ID'],
      url: error.config?.url, 
      status: error.response?.status, 
      data: error.response?.data 
    });

    // Handle token expiration or authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Authentication error detected, clearing local storage');
      
      // Clear token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Services
export const authAPI = {
  // Auth routes from authRoutes.js
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; phone: string; password: string }) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  getUserProfile: (userId: string) => api.get(`/auth/profile/${userId}`),
  updateUserProfile: (userId: string, data: any) => api.patch(`/auth/update/${userId}`, data),
  deleteUser: (userId: string) => api.delete(`/auth/delete/${userId}`),
};

export const userAPI = {
  // User profile endpoints - redirecting to auth endpoints
  getUserProfile: () => authAPI.getCurrentUser(),
  updateUserProfile: (data: any) => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    return authAPI.updateUserProfile(userId, data);
  },
};

export const appointmentAPI = {
  // Appointment routes from appointmentRoutes.js
  getPatientAppointments: () => api.get('/appointments/my'),
  getAllAppointments: () => api.get('/appointments/all'),
  bookAppointment: (data: any) => api.post('/appointments/book', data),
  cancelAppointment: (id: string) => api.patch(`/appointments/cancel/${id}`),
  
  // Additional appointment endpoints (not explicitly in routes but might be needed)
  getAppointmentDetails: (id: string) => api.get(`/appointments/${id}`),
  rescheduleAppointment: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
};

export const doctorAPI = {
  // Doctor routes from doctorRoutes.js
  getAllDoctors: () => api.get('/doctors'),
  getDoctorById: (id: string) => api.get(`/doctors/${id}`),
  getTodayAppointments: () => api.get('/doctors/appointments/today'),
  getAppointmentsByDate: (date: string) => api.get(`/doctors/appointments?date=${date}`),
  // getPatientSummary: (appointmentId: string) => api.get(`/doctors/appointment/${appointmentId}/patient-summary`),
  getAppointmentDetails: (appointmentId: string) => api.get(`/doctors/appointment/${appointmentId}/patient-summary`),
  
  // Doctor profile management
  getDoctorProfile: () => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    return api.get(`/doctors/${userId}`);
  },
};

export const scheduleAPI = {
  // Schedule routes from scheduleRoutes.js
  getDoctorAvailability: (doctorId: string) => api.get(`/schedule/${doctorId}`),
  setDoctorAvailability: (data: { date: string, startTime: string, endTime: string, interval: number }) => 
    api.post('/schedule', data),
  updateDoctorAvailability: (data: { date: string, startTime: string, endTime: string, interval: number }) => 
    api.patch('/schedule', data),
  // First get doctor profile to find doctorId, then get schedule
  getDoctorScheduleOverview: async () => {
    try {
      // Get the user ID from localStorage
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      
      // Get the doctor profile using userId (now the backend searches by userId)
      const doctorResponse = await api.get(`/doctors/${userId}`);
      
      // Get the doctor's ID (the MongoDB document _id)
      const doctorId = doctorResponse.data._id;
      
      // Then get the schedule using the doctor ID
      return api.get(`/schedule/${doctorId}`);
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
      throw error;
    }
  },
  // Get appointments for a specific date (using doctor routes)
  getAppointmentsByDate: (date: string) => {
    return api.get(`/doctors/appointments?date=${date}`);
  },
};

export const patientAPI = {
  // Patient-specific endpoints (these would need to be implemented on the backend)
  getPatientProfile: () => userAPI.getUserProfile(),
  updatePatientProfile: (data: any) => userAPI.updateUserProfile(data),
  getMedicalRecords: () => api.get('/patients/medical-records'),
  getMedicalRecordDetails: (id: string) => api.get(`/patients/medical-records/${id}`),
};

export const adminAPI = {
  // Admin routes from adminRoutes.js
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllPatients: () => api.get('/admin/patients'),
  getAllDoctors: () => api.get('/admin/doctors'),
  createDoctor: (data: any) => api.post('/admin/doctors', data),
  updateDoctor: (id: string, data: any) => api.patch(`/admin/doctors/${id}`, data),
  deleteDoctor: (id: string) => api.delete(`/admin/doctors/${id}`),
  
  // Analytics endpoints
  getAppointmentStats: () => api.get('/admin/analytics/appointments'),
  getUserStats: () => api.get('/admin/analytics/users'),
};

export const chatbotAPI = {
  // Chatbot routes from chatbotRoutes.js
  sendMessage: (userId: string, message: string) => api.post('/ai/chatbot', { userId, message }),
};

export default api;
