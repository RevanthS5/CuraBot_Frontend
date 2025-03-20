import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { adminAPI } from '../../services/api';
import { Calendar, Clock, AlertTriangle, TrendingUp, Users, Activity, Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

// Theme-aligned color palette
const THEME_COLORS = {
  primary: {
    light: '#E0F2FE', // primary-100
    medium: '#38BDF8', // primary-400
    default: '#0EA5E9', // primary-500
    dark: '#0369A1', // primary-700
  },
  secondary: {
    light: '#F0FDFA', // secondary-100
    medium: '#5EEAD4', // secondary-400
    default: '#14B8A6', // secondary-500
    dark: '#0F766E', // secondary-700
  },
  accent: {
    yellow: '#FEF3C7', // amber-100
    yellowDark: '#F59E0B', // amber-500
    purple: '#F3E8FF', // purple-100
    purpleDark: '#9333EA', // purple-600
    pink: '#FCE7F3', // pink-100
    pinkDark: '#DB2777', // pink-600
  },
  neutral: {
    gray1: '#F3F4F6', // gray-100
    gray2: '#E5E7EB', // gray-200
    gray3: '#D1D5DB', // gray-300
    gray4: '#9CA3AF', // gray-400
    gray5: '#6B7280', // gray-500
    gray6: '#4B5563', // gray-600
  },
  status: {
    success: '#10B981', // green-500
    warning: '#F59E0B', // amber-500
    error: '#EF4444', // red-500
    info: '#3B82F6', // blue-500
  }
};

// Chart colors in theme
const CHART_COLORS = [
  THEME_COLORS.primary.default,
  THEME_COLORS.secondary.default,
  THEME_COLORS.accent.yellowDark,
  THEME_COLORS.accent.purpleDark,
  THEME_COLORS.accent.pinkDark,
  THEME_COLORS.status.success,
  THEME_COLORS.status.info,
  THEME_COLORS.status.warning,
  THEME_COLORS.status.error,
  THEME_COLORS.neutral.gray5,
];

// Custom tooltip styles
const CustomTooltipStyle = {
  backgroundColor: 'white',
  border: `1px solid ${THEME_COLORS.neutral.gray3}`,
  borderRadius: '0.375rem',
  padding: '0.75rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={CustomTooltipStyle}>
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center mt-1">
            <div 
              className="w-3 h-3 mr-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}: </span>
            <span className="text-sm font-medium ml-1 text-gray-800">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const navigate = useNavigate();
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
      { name: 'Completed', value: completedAppointments, color: THEME_COLORS.status.success },
      { name: 'Cancelled', value: cancelledAppointments, color: THEME_COLORS.status.error },
      { name: 'Pending', value: pendingAppointments, color: THEME_COLORS.status.warning }
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
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0"
      >
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-primary-600 hover:text-primary-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
            AI Analytics Dashboard
          </h2>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPeriod('day')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === 'day'
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === 'week'
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4" 
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !analyticsData?.aiInsights ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No analytics data available for the selected period.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-primary-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="text-xl font-bold">{analyticsData.totalAppointments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
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
            
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
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
            
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-secondary-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="bg-secondary-100 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-secondary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="text-xl font-bold capitalize">{analyticsData.period}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Insights and Recommendations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Award className="h-5 w-5 text-primary-500 mr-2" />
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
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <h4 className="font-medium text-primary-800 mb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {analyticsData.aiInsights.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-primary-700">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>

          {/* Doctor Availability Chart */}
          {analyticsData.aiInsights.doctorAvailability && analyticsData.aiInsights.doctorAvailability.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Users className="h-5 w-5 text-primary-500 mr-2" />
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
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.neutral.gray2} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: THEME_COLORS.neutral.gray6 }}
                      axisLine={{ stroke: THEME_COLORS.neutral.gray3 }}
                    />
                    <YAxis 
                      tick={{ fill: THEME_COLORS.neutral.gray6 }}
                      axisLine={{ stroke: THEME_COLORS.neutral.gray3 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: 10 }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="availableSlots" 
                      name="Available Slots" 
                      stackId="a" 
                      fill={THEME_COLORS.secondary.default}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="bookedSlots" 
                      name="Booked Slots" 
                      stackId="a" 
                      fill={THEME_COLORS.primary.default}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Appointment Status Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 text-primary-500 mr-2" />
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
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={THEME_COLORS.neutral.gray1}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Peak Hours */}
          {analyticsData.aiInsights.peakHours && analyticsData.aiInsights.peakHours.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-primary-500 mr-2" />
                Peak Hours
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={preparePeakHoursData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.neutral.gray2} />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fill: THEME_COLORS.neutral.gray6 }}
                      axisLine={{ stroke: THEME_COLORS.neutral.gray3 }}
                    />
                    <YAxis 
                      tick={{ fill: THEME_COLORS.neutral.gray6 }}
                      axisLine={{ stroke: THEME_COLORS.neutral.gray3 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      iconType="circle"
                    />
                    <defs>
                      <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME_COLORS.primary.default} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={THEME_COLORS.primary.default} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="patients" 
                      name="Patient Volume" 
                      stroke={THEME_COLORS.primary.dark} 
                      fillOpacity={1}
                      fill="url(#patientGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Doctor Workload */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-primary-500 mr-2" />
              Doctor Workload
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={prepareOverloadedDoctorsData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.neutral.gray2} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: THEME_COLORS.neutral.gray6 }}
                    axisLine={{ stroke: THEME_COLORS.neutral.gray3 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke={THEME_COLORS.primary.default}
                    tick={{ fill: THEME_COLORS.neutral.gray6 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke={THEME_COLORS.secondary.default}
                    tick={{ fill: THEME_COLORS.neutral.gray6 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle"
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="appointments" 
                    name="Total Appointments" 
                    fill={THEME_COLORS.primary.default}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="workload" 
                    name="Workload (%)" 
                    stroke={THEME_COLORS.secondary.dark}
                    strokeWidth={2}
                    dot={{ fill: THEME_COLORS.secondary.dark, r: 4 }}
                    activeDot={{ r: 6, fill: THEME_COLORS.secondary.dark }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Weekly Appointment Heatmap (Simulated) */}
          {period === 'week' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-primary-500 mr-2" />
                Weekly Appointment Heatmap
              </h3>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="grid grid-cols-10 gap-1">
                    <div className="h-10"></div>
                    {['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'].map(time => (
                      <div key={time} className="h-10 flex items-center justify-center text-xs font-medium text-gray-600">
                        {time}
                      </div>
                    ))}
                    
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <React.Fragment key={day}>
                        <div className="h-10 flex items-center text-xs font-medium text-gray-600">
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
                              className="h-10 rounded transition-all hover:transform hover:scale-105"
                              style={{ 
                                backgroundColor: `rgba(14, 165, 233, ${intensity / 100})`, // primary-500 with opacity
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
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
