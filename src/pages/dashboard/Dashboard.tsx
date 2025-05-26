import React, { useState } from 'react';
import { Car, Users, Wrench, Calendar, BarChart2, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const { language } = useLanguageStore();
  const t = translations[language].dashboard;
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [statsTimeRange, setStatsTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock stats data for different time ranges
  const statsData = {
    week: [
      { label: t.stats.totalVehicles, value: '12', icon: Car, color: 'text-blue-600 dark:text-blue-400' },
      { label: t.stats.activeDrivers, value: '8', icon: Users, color: 'text-green-600 dark:text-green-400' },
      { label: t.stats.pendingMaintenance, value: '3', icon: Wrench, color: 'text-yellow-600 dark:text-yellow-400' },
      { label: t.stats.scheduledServices, value: '5', icon: Calendar, color: 'text-purple-600 dark:text-purple-400' },
    ],
    month: [
      { label: t.stats.totalVehicles, value: '24', icon: Car, color: 'text-blue-600 dark:text-blue-400' },
      { label: t.stats.activeDrivers, value: '18', icon: Users, color: 'text-green-600 dark:text-green-400' },
      { label: t.stats.pendingMaintenance, value: '5', icon: Wrench, color: 'text-yellow-600 dark:text-yellow-400' },
      { label: t.stats.scheduledServices, value: '12', icon: Calendar, color: 'text-purple-600 dark:text-purple-400' },
    ],
    year: [
      { label: t.stats.totalVehicles, value: '45', icon: Car, color: 'text-blue-600 dark:text-blue-400' },
      { label: t.stats.activeDrivers, value: '32', icon: Users, color: 'text-green-600 dark:text-green-400' },
      { label: t.stats.pendingMaintenance, value: '15', icon: Wrench, color: 'text-yellow-600 dark:text-yellow-400' },
      { label: t.stats.scheduledServices, value: '28', icon: Calendar, color: 'text-purple-600 dark:text-purple-400' },
    ],
  };

  const quickActions = [
    { label: t.quickActions.addVehicle, icon: Car, to: '/vehicles/new' },
    { label: t.quickActions.addDriver, icon: Users, to: '/users/new' },
    { label: t.quickActions.scheduleService, icon: Wrench, to: '/maintenance/new' },
    { label: t.quickActions.viewCalendar, icon: Calendar, to: '/maintenance/calendar' },
  ];

  // Mock data for the maintenance chart
  const maintenanceData = {
    week: [
      { name: 'Mon', value: 2 },
      { name: 'Tue', value: 3 },
      { name: 'Wed', value: 1 },
      { name: 'Thu', value: 4 },
      { name: 'Fri', value: 2 },
      { name: 'Sat', value: 1 },
      { name: 'Sun', value: 0 },
    ],
    month: [
      { name: 'Week 1', value: 8 },
      { name: 'Week 2', value: 12 },
      { name: 'Week 3', value: 7 },
      { name: 'Week 4', value: 10 },
    ],
    year: [
      { name: 'Jan', value: 30 },
      { name: 'Feb', value: 25 },
      { name: 'Mar', value: 35 },
      { name: 'Apr', value: 28 },
      { name: 'May', value: 32 },
      { name: 'Jun', value: 40 },
      { name: 'Jul', value: 38 },
      { name: 'Aug', value: 35 },
      { name: 'Sep', value: 42 },
      { name: 'Oct', value: 30 },
      { name: 'Nov', value: 35 },
      { name: 'Dec', value: 28 },
    ],
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setStatsTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              statsTimeRange === 'week'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setStatsTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              statsTimeRange === 'month'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setStatsTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
              statsTimeRange === 'year'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            This Year
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData[statsTimeRange].map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.color.replace('text', 'bg').replace('600', '100').replace('400', '900')} bg-opacity-10`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</h3>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Maintenance Statistics</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {chartType === 'bar' ? <LineChart className="h-5 w-5" /> : <BarChart2 className="h-5 w-5" />}
              </button>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    timeRange === 'week'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 text-sm font-medium border-t border-b ${
                    timeRange === 'month'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                    timeRange === 'year'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={maintenanceData[timeRange]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <RechartsLineChart data={maintenanceData[timeRange]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7' }} />
                </RechartsLineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.recentActivities.title}</h2>
          <div className="space-y-4">
            {[
              { title: t.recentActivities.maintenance, desc: 'Truck #123 scheduled for oil change', time: '2 hours ago' },
              { title: t.recentActivities.driverAssignment, desc: 'John Doe assigned to Route #456', time: '4 hours ago' },
              { title: t.recentActivities.fuelReport, desc: 'Monthly fuel consumption report generated', time: '1 day ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{activity.desc}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.quickActions.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.to}
                className="flex items-center justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;