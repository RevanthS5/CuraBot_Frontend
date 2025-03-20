import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, ClipboardList, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TodayAppointments from './TodayAppointments.tsx';
import ScheduleOverview from './ScheduleOverview.tsx';
import ManageSchedule from './ManageSchedule.tsx';
import AppointmentDetails from './AppointmentDetails.tsx';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 px-4 py-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">Manage your appointments and schedule</p>
        </div>
        <div className="mt-4 md:mt-0">
          <nav className="flex flex-wrap gap-2">
            <Link
              to="/doctor"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                isActive('/doctor') && !isActive('/doctor/schedule') && !isActive('/doctor/manage-schedule')
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock className="mr-1.5 h-4 w-4" />
              Today's Appointments
            </Link>
            <Link
              to="/doctor/schedule"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                isActive('/doctor/schedule')
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Calendar className="mr-1.5 h-4 w-4" />
              Schedule Overview
            </Link>
            <Link
              to="/doctor/manage-schedule"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                isActive('/doctor/manage-schedule')
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ClipboardList className="mr-1.5 h-4 w-4" />
              Manage Schedule
            </Link>
          </nav>
        </div>
      </div>

      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <Routes>
          <Route index element={<TodayAppointments />} />
          <Route path="schedule" element={<ScheduleOverview />} />
          <Route path="manage-schedule" element={<ManageSchedule />} />
          <Route path="appointment/:appointmentId" element={<AppointmentDetails />} />
          <Route path="*" element={<Navigate to="/doctor" replace />} />
        </Routes>
      </motion.div>
    </motion.div>
  );
}