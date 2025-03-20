import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, UserPlus, Calendar, Clock, Activity, BarChart3 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { motion } from 'framer-motion';

// Import admin components
import DoctorManagement from './DoctorManagement.tsx';
import DoctorDetails from './DoctorDetails.tsx';
import PatientList from './PatientList.tsx';
import Analytics from './Analytics.tsx';

interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  todayAppointments: number;
  availableDoctors: number;
}

export default function AdminDashboard() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Activity className="h-6 w-6 mr-2 text-primary-500" />
          Admin Dashboard
        </h1>
        <div className="mt-4 md:mt-0">
          <nav className="flex space-x-4">
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/admin') && !location.pathname.match(/^\/admin\/(doctors|patients|analytics)/)
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/doctors"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/admin/doctors')
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Doctors
            </Link>
            <Link
              to="/admin/patients"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/admin/patients')
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Patients
            </Link>
            <Link
              to="/admin/analytics"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/admin/analytics')
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Analytics
            </Link>
          </nav>
        </div>
      </motion.div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="doctors/:id" element={<DoctorDetails />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AdminHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalPatients: 0,
    todayAppointments: 0,
    availableDoctors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getDashboardStats();
        
        if (isMounted) {
          setStats(response.data);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        if (isMounted) {
          setError('Failed to load dashboard statistics. Please try again later.');
          setIsLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <motion.h2 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-semibold text-gray-800 flex items-center"
      >
        <BarChart3 className="h-5 w-5 mr-2 text-primary-500" />
        Hospital Overview
      </motion.h2>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" 
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-full mr-4">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Doctors</h3>
                  <p className="text-2xl font-bold text-primary-600">{stats.totalDoctors}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-secondary-500 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 p-3 rounded-full mr-4">
                  <UserPlus className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
                  <p className="text-2xl font-bold text-secondary-600">{stats.totalPatients}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Today's Appointments</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.todayAppointments}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Available Doctors</h3>
                  <p className="text-2xl font-bold text-amber-600">{stats.availableDoctors}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Dashboard Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary-500" />
              System Status
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <p className="text-gray-700">All systems operational. The CuraBot AI assistant is actively monitoring patient data and providing diagnostic support.</p>
              
              <div className="mt-4 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">95%</span>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">Last system check: Today at {new Date().toLocaleTimeString()}</p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}