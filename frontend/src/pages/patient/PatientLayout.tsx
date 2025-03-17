import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Calendar, FileText, MessageSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import Dashboard from './Dashboard';
import Appointments from './Appointments';
import BookAppointment from './BookAppointment';
import AppointmentDetails from './AppointmentDetails';
import MedicalRecords from './MedicalRecords';
import HealthAssistant from './HealthAssistant';
import Profile from './Profile';

export default function PatientLayout() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { to: '/patient/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/patient/appointments', icon: <Calendar className="h-5 w-5" />, label: 'Appointments' },
    { to: '/patient/records', icon: <FileText className="h-5 w-5" />, label: 'Medical Records' },
    { to: '/patient/health-assistant', icon: <MessageSquare className="h-5 w-5" />, label: 'Health Assistant' },
    { to: '/patient/profile', icon: <User className="h-5 w-5" />, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">CuraBot</h1>
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="mr-3 flex-shrink-0">{item.icon}</div>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 group block w-full flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-primary-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">CuraBot</h1>
        <div className="flex space-x-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs ${
                  isActive ? 'text-white' : 'text-primary-200 hover:text-white'
                }`
              }
            >
              {item.icon}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-xs text-primary-200 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/:id" element={<AppointmentDetails />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="health-assistant" element={<HealthAssistant />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
