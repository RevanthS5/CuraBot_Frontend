import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Users, UserPlus, Calendar, Activity, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

// Import admin components (we'll create these next)
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
  const { user } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <nav className="flex space-x-4">
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin') && !location.pathname.match(/^\/admin\/(doctors|patients|analytics)/)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/doctors"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin/doctors')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Doctors
            </Link>
            <Link
              to="/admin/patients"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin/patients')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Patients
            </Link>
            <Link
              to="/admin/analytics"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/admin/analytics')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Analytics
            </Link>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
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
      <h2 className="text-xl font-semibold text-gray-800">Hospital Overview</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex items-center">
                <Users className="h-10 w-10 text-blue-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Doctors</h3>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalDoctors}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex items-center">
                <UserPlus className="h-10 w-10 text-green-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPatients}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <div className="flex items-center">
                <Calendar className="h-10 w-10 text-purple-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Today's Appointments</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.todayAppointments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-amber-500">
              <div className="flex items-center">
                <Clock className="h-10 w-10 text-amber-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Available Doctors</h3>
                  <p className="text-2xl font-bold text-amber-600">{stats.availableDoctors}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/admin/doctors" 
                className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-blue-500 transition-colors"
              >
                <h4 className="font-medium text-gray-900">Manage Doctors</h4>
                <p className="text-gray-600 text-sm mt-1">Add, update, or remove doctors</p>
              </Link>
              
              <Link 
                to="/admin/patients" 
                className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-blue-500 transition-colors"
              >
                <h4 className="font-medium text-gray-900">View Patients</h4>
                <p className="text-gray-600 text-sm mt-1">See all registered patients</p>
              </Link>
              
              <Link 
                to="/admin/analytics" 
                className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-blue-500 transition-colors"
              >
                <h4 className="font-medium text-gray-900">AI Analytics</h4>
                <p className="text-gray-600 text-sm mt-1">View AI-powered insights</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}