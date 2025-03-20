import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Calendar, FileText, MessageSquare, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

import Dashboard from './Dashboard';
import Appointments from './Appointments';
import BookAppointment from './BookAppointment';
import AppointmentDetails from './AppointmentDetails';
import MedicalRecords from './MedicalRecords';
import Assistant from './Assistant';
import Profile from './Profile';

export default function PatientLayout() {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { to: '/patient/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/patient/appointments', icon: <Calendar className="h-5 w-5" />, label: 'Appointments' },
    { to: '/patient/records', icon: <FileText className="h-5 w-5" />, label: 'Medical Records' },
    { to: '/patient/assistant', icon: <MessageSquare className="h-5 w-5" />, label: 'Health Assistant' },
    { to: '/patient/profile', icon: <User className="h-5 w-5" />, label: 'Profile' },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <motion.div 
        className="hidden md:flex md:flex-col md:w-72 md:fixed md:inset-y-0 bg-white shadow-lg z-20"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-20 flex-shrink-0 px-6 bg-gradient-to-r from-primary-600 to-secondary-600">
            <h1 className="text-2xl font-bold text-white">CuraBot</h1>
          </div>
          <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
            <div className="px-6 mb-8">
              <div className="bg-primary-50 rounded-lg p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg mr-3">
                  {user?.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Patient'}</p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
              </div>
            </div>
            <nav className="px-4 space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`
                  }
                >
                  <div className={`mr-3 flex-shrink-0 transition-all duration-200 ${
                    ({ isActive }: { isActive: boolean }) => isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {item.icon}
                  </div>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile header and menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 flex items-center justify-between shadow-md">
          <h1 className="text-xl font-bold">CuraBot</h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile sidebar menu */}
        <motion.div 
          className="fixed inset-0 z-20 bg-white pt-16"
          initial="closed"
          animate={isMobileMenuOpen ? "open" : "closed"}
          variants={sidebarVariants}
        >
          <div className="p-4 border-b border-gray-200 mb-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg mr-3">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name || 'Patient'}</p>
                <p className="text-sm text-gray-500">Patient</p>
              </div>
            </div>
          </div>
          
          <nav className="px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }`
                }
              >
                <div className="mr-4 flex-shrink-0">{item.icon}</div>
                {item.label}
              </NavLink>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md mt-4"
            >
              <LogOut className="mr-4 h-5 w-5" />
              Logout
            </button>
          </nav>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="md:pl-72 flex flex-col flex-1 w-full">
        <main className="flex-1 p-6 pt-8 md:pt-6 overflow-y-auto mt-14 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="container-custom mx-auto"
          >
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/:id" element={<AppointmentDetails />} />
              <Route path="appointments/book" element={<BookAppointment />} />
              <Route path="records" element={<MedicalRecords />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
