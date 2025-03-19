import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.name}</h1>
        <div className="mt-4 md:mt-0">
          <nav className="flex space-x-4">
            <Link
              to="/doctor"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/doctor') && !isActive('/doctor/schedule') && !isActive('/doctor/manage-schedule')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Today's Appointments
            </Link>
            <Link
              to="/doctor/schedule"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/doctor/schedule')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Schedule Overview
            </Link>
            <Link
              to="/doctor/manage-schedule"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/doctor/manage-schedule')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Manage Schedule
            </Link>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Routes>
          <Route index element={<TodayAppointments />} />
          <Route path="schedule" element={<ScheduleOverview />} />
          <Route path="manage-schedule" element={<ManageSchedule />} />
          <Route path="appointment/:appointmentId" element={<AppointmentDetails />} />
          <Route path="*" element={<Navigate to="/doctor" replace />} />
        </Routes>
      </div>
    </div>
  );
}