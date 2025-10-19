import React, { useState } from 'react';
import { TrendingUp, Users, Calendar, Bike, Download, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

export default function BikeRentalDashboard() {
  const [dateRange, setDateRange] = useState('7d');

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
    { label: 'Total Revenue', value: '₹2.14L', change: '+18.2%', trend: 'up', icon: TrendingUp, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { label: 'Active Rentals', value: '145', change: '+12.5%', trend: 'up', icon: Bike, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { label: 'Total Customers', value: '462', change: '+23.1%', trend: 'up', icon: Users, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    { label: 'Avg. Rental Days', value: '4.2', change: '+0.3', trend: 'up', icon: Calendar, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
  ];

  const getStatusStyle = (status) => {
    const styles = {
      active: { background: '#dcfce7', color: '#166534', border: '2px solid #86efac' },
      overdue: { background: '#fee2e2', color: '#991b1b', border: '2px solid #fca5a5' },
      completed: { background: '#dbeafe', color: '#1e40af', border: '2px solid #93c5fd' },
      cancelled: { background: '#f3f4f6', color: '#374151', border: '2px solid #d1d5db' }
    };
    return styles[status] || styles.cancelled;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle style={{ width: '16px', height: '16px' }} />,
      overdue: <AlertCircle style={{ width: '16px', height: '16px' }} />,
      completed: <CheckCircle style={{ width: '16px', height: '16px' }} />,
      cancelled: <XCircle style={{ width: '16px', height: '16px' }} />
    };
    return icons[status] || <Clock style={{ width: '16px', height: '16px' }} />;
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 85) return '#16a34a';
    if (utilization >= 70) return '#ea580c';
    return '#dc2626';
  };

  const getUtilizationBarColor = (utilization) => {
    if (utilization >= 85) return '#10b981';
    if (utilization >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: '30px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '4px'
              }}>
                Rental Admin Dashboard
              </h1>
              <p style={{ color: '#64748b' }}>Manage your bike rental business</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s'
              }}>
                <Download style={{ width: '16px', height: '16px' }} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              padding: '24px',
              border: '1px solid #f1f5f9',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: stat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <stat.icon style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: stat.trend === 'up' ? '#16a34a' : '#dc2626'
                }}>
                  {stat.trend === 'up' ? <ArrowUp style={{ width: '16px', height: '16px' }} /> : <ArrowDown style={{ width: '16px', height: '16px' }} />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>{stat.label}</p>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Revenue Chart */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            padding: '24px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Weekly Performance</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '4px 12px',
                  fontSize: '14px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>Revenue</button>
                <button style={{
                  padding: '4px 12px',
                  fontSize: '14px',
                  color: '#64748b',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>Bookings</button>
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
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fleet Status */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            padding: '24px',
            border: '1px solid #f1f5f9'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '24px' }}>Fleet Status</h2>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {fleetStatus.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{item.value}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Popular Bikes */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            padding: '24px',
            border: '1px solid #f1f5f9'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '24px' }}>Most Rented Bikes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {popularBikes.map((bike, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
                  borderRadius: '12px',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{bike.name}</p>
                        <p style={{ fontSize: '14px', color: '#6366f1', fontWeight: '600' }}>{bike.rate}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{bike.rentals} rentals</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Utilization</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: getUtilizationColor(bike.utilization) }}>
                      {bike.utilization}%
                    </span>
                  </div>
                  <div style={{ width: '100%', background: '#e2e8f0', borderRadius: '9999px', height: '8px' }}>
                    <div style={{
                      height: '8px',
                      borderRadius: '9999px',
                      width: `${bike.utilization}%`,
                      background: getUtilizationBarColor(bike.utilization),
                      transition: 'width 0.5s'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Rentals */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            padding: '24px',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Active Rentals</h2>
              <button style={{
                color: '#6366f1',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                <span>View All</span>
                <Eye style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeRentals.map((rental, idx) => {
                const statusStyle = getStatusStyle(rental.status);
                return (
                  <div key={idx} style={{
                    padding: '16px',
                    border: statusStyle.border,
                    borderRadius: '12px',
                    background: statusStyle.background,
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>{rental.id}</span>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: statusStyle.color,
                        background: 'rgba(255,255,255,0.5)'
                      }}>
                        {getStatusIcon(rental.status)}
                        <span style={{ textTransform: 'capitalize' }}>{rental.status}</span>
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>{rental.customer}</p>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>{rental.bike}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        <span>{rental.startDate} - {rental.endDate}</span>
                      </div>
                      <span style={{ fontWeight: '600' }}>{rental.days} days</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                        <MapPin style={{ width: '12px', height: '12px' }} />
                        <span>{rental.pickup}</span>
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{rental.amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Booking Trends */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          padding: '24px',
          border: '1px solid #f1f5f9'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '24px' }}>Daily Booking Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rentalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="bookings" fill="#6366f1" radius={[8, 8, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}