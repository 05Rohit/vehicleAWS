import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import {
  TrendingUp, Users, Calendar, Bike, Download, MapPin, Clock,
  CheckCircle, AlertCircle, XCircle, Eye, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';

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
    { label: 'Total Revenue', value: '₹2.14L', change: '+18.2%', trend: 'up', icon: TrendingUp },
    { label: 'Active Rentals', value: '145', change: '+12.5%', trend: 'up', icon: Bike },
    { label: 'Total Customers', value: '462', change: '+23.1%', trend: 'up', icon: Users },
    { label: 'Avg. Rental Days', value: '4.2', change: '+0.3', trend: 'up', icon: Calendar }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'overdue': return styles.statusOverdue;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusDefault;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className={styles.iconSmall} />;
      case 'overdue': return <AlertCircle className={styles.iconSmall} />;
      case 'completed': return <CheckCircle className={styles.iconSmall} />;
      case 'cancelled': return <XCircle className={styles.iconSmall} />;
      default: return <Clock className={styles.iconSmall} />;
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 85) return styles.utilizationHigh;
    if (utilization >= 70) return styles.utilizationMedium;
    return styles.utilizationLow;
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Rental Admin Dashboard</h1>
            <p className={styles.headerSubtitle}>Manage your bike rental business</p>
          </div>
          <div className={styles.headerActions}>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.dateSelect}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className={styles.exportButton}>
              <Download className={styles.iconSmall} />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <stat.icon className={styles.iconMedium} />
                </div>
                <div className={styles.statTrend}>
                  {stat.trend === 'up' ? <ArrowUp className={styles.iconTiny} /> : <ArrowDown className={styles.iconTiny} />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts, Fleet, Tables, etc. */}
        {/* Keep JSX same — just apply module CSS names accordingly */}
      </div>
    </div>
  );
}
