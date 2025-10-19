
import React, { useState } from 'react';
import { TrendingUp, Users, Calendar, Bike, Download, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Eye, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

export default function BikeRentalDashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [viewMode, setViewMode] = useState('overview');

  const rentalData = [
    { day: 'Mon', bookings: 45, revenue: 18500, duration: 3.2 },
    { day: 'Tue', bookings: 52, revenue: 22000, duration: 4.1 },
    { day: 'Wed', bookings: 48, revenue: 19800, duration: 3.8 },
    { day: 'Thu', bookings: 61, revenue: 28500, duration: 4.5 },
    { day: 'Fri', bookings: 73, revenue: 35200, duration: 4.8 },
    { day: 'Sat', bookings: 95, revenue: 48000, duration: 5.2 },
    { day: 'Sun', bookings: 88, revenue: 42500, duration: 4.9 }
  ];

  const fleetStatus = [
    { name: 'Rented', value: 145, color: '#10b981', percent: 58 },
    { name: 'Available', value: 78, color: '#3b82f6', percent: 31 },
    { name: 'Maintenance', value: 18, color: '#f59e0b', percent: 7 },
    { name: 'Out of Service', value: 9, color: '#ef4444', percent: 4 }
  ];

  const popularBikes = [
    { name: 'Royal Enfield Classic 350', rentals: 156, rate: '₹800/day', utilization: 92, status: 'high' },
    { name: 'Royal Enfield Hunter 350', rentals: 142, rate: '₹750/day', utilization: 88, status: 'high' },
    { name: 'Royal Enfield Meteor 350', rentals: 128, rate: '₹850/day', utilization: 85, status: 'high' },
    { name: 'Royal Enfield Interceptor 650', rentals: 94, rate: '₹1200/day', utilization: 78, status: 'medium' },
    { name: 'Royal Enfield Himalayan', rentals: 87, rate: '₹900/day', utilization: 72, status: 'medium' }
  ];

  const activeRentals = [
    { id: '#RNT-2847', customer: 'Rahul Sharma', bike: 'Classic 350', startDate: '16 Oct', endDate: '19 Oct', days: 3, amount: '₹2,400', status: 'active', pickup: 'Connaught Place' },
    { id: '#RNT-2846', customer: 'Priya Patel', bike: 'Hunter 350', startDate: '16 Oct', endDate: '17 Oct', days: 1, amount: '₹750', status: 'active', pickup: 'Karol Bagh' },
    { id: '#RNT-2845', customer: 'Amit Kumar', bike: 'Meteor 350', startDate: '15 Oct', endDate: '20 Oct', days: 5, amount: '₹4,250', status: 'active', pickup: 'Dwarka' },
    { id: '#RNT-2844', customer: 'Sneha Reddy', bike: 'Interceptor 650', startDate: '14 Oct', endDate: '21 Oct', days: 7, amount: '₹8,400', status: 'overdue', pickup: 'Nehru Place' },
    { id: '#RNT-2843', customer: 'Vikram Singh', bike: 'Himalayan', startDate: '16 Oct', endDate: '18 Oct', days: 2, amount: '₹1,800', status: 'active', pickup: 'Rajouri Garden' }
  ];

  const stats = [
    { label: 'Total Revenue', value: '₹2.14L', change: '+18.2%', trend: 'up', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { label: 'Active Rentals', value: '145', change: '+12.5%', trend: 'up', icon: Bike, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Customers', value: '462', change: '+23.1%', trend: 'up', icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Avg. Rental Days', value: '4.2', change: '+0.3', trend: 'up', icon: Calendar, color: 'from-orange-500 to-orange-600' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 85) return 'text-green-600';
    if (utilization >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Rental Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Manage your bike rental business</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue & Bookings Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Weekly Performance</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg font-medium">Revenue</button>
                <button className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Bookings</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={rentalData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fleet Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Fleet Status</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={fleetStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fleetStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {fleetStatus.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    <span className="text-xs text-slate-500">({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Bikes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Most Rented Bikes</h2>
            <div className="space-y-3">
              {popularBikes.map((bike, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{bike.name}</p>
                        <p className="text-sm text-indigo-600 font-medium">{bike.rate}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{bike.rentals} rentals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Utilization</span>
                    <span className={`text-sm font-bold ${getUtilizationColor(bike.utilization)}`}>
                      {bike.utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${bike.utilization >= 85 ? 'bg-green-500' : bike.utilization >= 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${bike.utilization}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Rentals */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Active Rentals</h2>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center space-x-1">
                <span>View All</span>
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {activeRentals.map((rental, idx) => (
                <div key={idx} className={`p-4 border-2 rounded-xl hover:shadow-md transition-all ${getStatusColor(rental.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{rental.id}</span>
                    <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                      {getStatusIcon(rental.status)}
                      <span className="capitalize">{rental.status}</span>
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">{rental.customer}</p>
                  <p className="text-sm text-slate-600 mb-2">{rental.bike}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rental.startDate} - {rental.endDate}</span>
                    </div>
                    <span className="font-medium">{rental.days} days</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="flex items-center space-x-1 text-xs text-slate-600">
                      <MapPin className="w-3 h-3" />
                      <span>{rental.pickup}</span>
                    </div>
                    <span className="font-bold text-slate-900">{rental.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Daily Booking Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rentalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="#6366f1" radius={[8, 8, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}