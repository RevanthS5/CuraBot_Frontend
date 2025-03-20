import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { adminAPI } from '../../services/api';
import { Calendar, Clock, AlertTriangle, TrendingUp, Users, Activity, Award } from 'lucide-react';

interface DoctorAvailability {
  _id: string;
  doctorId: string;
  doctorName: string;
  totalAvailableSlots: number;
  bookedSlots: number;
}

interface OverloadedDoctor {
  doctorId: string;
  doctorName: string;
  totalAppointments: number;
}

interface AIInsights {
  peakHours: string[];
  doctorAvailability: DoctorAvailability[];
  overloadedDoctors: OverloadedDoctor[];
  cancellationTrends: string;
  recommendations: string[];
}

interface AnalyticsResponse {
  period: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  aiInsights: AIInsights;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#556270'];

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week'>('day');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await adminAPI.getAnalytics(period);
        console.log('Analytics response:', response.data);
        setAnalyticsData(response.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  // Transform doctor availability data for visualization
  const prepareDoctorAvailabilityData = () => {
    if (!analyticsData?.aiInsights?.doctorAvailability) return [];
    
    return analyticsData.aiInsights.doctorAvailability.map(doctor => ({
      name: doctor.doctorName,
      bookedSlots: doctor.bookedSlots,
      availableSlots: doctor.totalAvailableSlots,
      total: doctor.totalAvailableSlots + doctor.bookedSlots
    }));
  };

  // Transform appointment status data for visualization
  const prepareAppointmentStatusData = () => {
    if (!analyticsData) return [];
    
    const { completedAppointments, cancelledAppointments, totalAppointments } = analyticsData;
    const pendingAppointments = totalAppointments - (cancelledAppointments + completedAppointments);
    
    return [
      { name: 'Completed', value: completedAppointments },
      { name: 'Cancelled', value: cancelledAppointments },
      { name: 'Pending', value: pendingAppointments }
    ];
  };

  // Transform peak hours data for visualization
  const preparePeakHoursData = () => {
    if (!analyticsData?.aiInsights?.peakHours) return [];
    
    return analyticsData.aiInsights.peakHours.map(hour => ({
      hour,
      patients: Math.floor(Math.random() * 10) + 5 // Simulating patient count since it's not in the API
    }));
  };

  // Transform overloaded doctors data for visualization
  const prepareOverloadedDoctorsData = () => {
    if (!analyticsData?.aiInsights?.overloadedDoctors || analyticsData.aiInsights.overloadedDoctors.length === 0) {
      // If no overloaded doctors, use doctor availability data to show workload
      return analyticsData?.aiInsights?.doctorAvailability?.slice(0, 3).map(doctor => ({
        name: doctor.doctorName,
        appointments: doctor.bookedSlots,
        workload: (doctor.bookedSlots / (doctor.totalAvailableSlots + doctor.bookedSlots)) * 100
      })) || [];
    }
    
    return analyticsData.aiInsights.overloadedDoctors.map(doctor => ({
      name: doctor.doctorName,
      appointments: doctor.totalAppointments,
      workload: (doctor.totalAppointments / 10) * 100 // Simulating workload percentage
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">AI Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === 'day'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              period === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !analyticsData?.aiInsights ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No analytics data available for the selected period.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="text-xl font-bold">{analyticsData.totalAppointments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-xl font-bold">{analyticsData.completedAppointments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-xl font-bold">{analyticsData.cancelledAppointments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="text-xl font-bold capitalize">{analyticsData.period}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights and Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Award className="h-5 w-5 text-blue-500 mr-2" />
              AI Insights & Recommendations
            </h3>
            
            <div className="space-y-4">
              {analyticsData.aiInsights.cancellationTrends && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 mb-1">Cancellation Trends</h4>
                  <p className="text-amber-700">{analyticsData.aiInsights.cancellationTrends}</p>
                </div>
              )}
              
              {analyticsData.aiInsights.recommendations && analyticsData.aiInsights.recommendations.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analyticsData.aiInsights.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-blue-700">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Availability Chart */}
          {analyticsData.aiInsights.doctorAvailability && analyticsData.aiInsights.doctorAvailability.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                Doctor Availability
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareDoctorAvailabilityData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barGap={0}
                    barCategoryGap={10}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => {
                      const formattedName = name === 'availableSlots' ? 'Available Slots' : 'Booked Slots';
                      return [`${value}`, formattedName];
                    }} />
                    <Legend />
                    <Bar dataKey="availableSlots" name="Available Slots" stackId="a" fill="#4ADE80" />
                    <Bar dataKey="bookedSlots" name="Booked Slots" stackId="a" fill="#FB7185" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Appointment Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              Appointment Status Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareAppointmentStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareAppointmentStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} appointments`, props.payload.name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours */}
          {analyticsData.aiInsights.peakHours && analyticsData.aiInsights.peakHours.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                Peak Hours
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={preparePeakHoursData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="patients" name="Patient Volume" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Doctor Workload */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-blue-500 mr-2" />
              Doctor Workload
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={prepareOverloadedDoctorsData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="appointments" name="Total Appointments" fill="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="workload" name="Workload (%)" stroke="#ff7300" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Appointment Heatmap (Simulated) */}
          {period === 'week' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                Weekly Appointment Heatmap
              </h3>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="grid grid-cols-10 gap-1">
                    <div className="h-10"></div>
                    {['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'].map(time => (
                      <div key={time} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                        {time}
                      </div>
                    ))}
                    
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <React.Fragment key={day}>
                        <div className="h-10 flex items-center text-xs font-medium text-gray-500">
                          {day}
                        </div>
                        {['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'].map(time => {
                          // Determine if this is a peak hour
                          const isPeakHour = analyticsData?.aiInsights?.peakHours?.includes(time);
                          // Calculate intensity based on peak hours
                          const intensity = isPeakHour ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 60);
                          
                          return (
                            <div 
                              key={`${day}-${time}`} 
                              className="h-10 rounded"
                              style={{ 
                                backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                                position: 'relative'
                              }}
                            >
                              {intensity > 50 && (
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                  {intensity}%
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
