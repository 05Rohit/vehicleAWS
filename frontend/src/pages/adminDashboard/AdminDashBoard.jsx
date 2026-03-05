import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Car,
  Calendar,
  DollarSign,
  Bell,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  User,
  Lock,
} from "lucide-react";

import styles from "./DashBoard.module.css";
import BookingStatusData from "./reportComponent/BookingStatusData";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminBookingMetrics } from "../../appRedux/redux/reportSlice/adminReportSlice";
import VehicleListData from "./reportComponent/VehicleListData";
import BookingDataList from "./reportComponent/BookingDataList";
import VehicleInventoryReport from "./reportComponent/VehicleInventoryReport";
import UserDataList from "./reportComponent/UserDataList";
import { formatDate } from "../../utils/formatDate";
import DLverifyPage from "./../AdminPages/DLverifyPage";
import { useNavigate } from "react-router-dom";

/* -------------------- MOCK DATA -------------------- */
const revenueData = [
  { date: "Mon", revenue: 4500 },
  { date: "Tue", revenue: 5200 },
  { date: "Wed", revenue: 4800 },
  { date: "Thu", revenue: 6100 },
  { date: "Fri", revenue: 7200 },
  { date: "Sat", revenue: 8500 },
  { date: "Sun", revenue: 7800 },
];

const vehicleData = {
  vehicleType: "Bike",
  model: "2023",
  specificVehicleDetails: [
    {
      vehicleNumber: "KA03CD2006",
      vehicleStatus: true,
      createdAt: "2026-01-04T06:56:51.674Z",
    },
    {
      vehicleNumber: "KA03CD2007",
      vehicleStatus: false,
      notAvailableReason: "Maintenance",
      createdAt: "2026-01-04T06:56:51.675Z",
    },
  ],
  count: 14,
};

/* -------------------- COMPONENT -------------------- */
const AdminDashboard = () => {
  const navigate = useNavigate();
  // UseSate
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redux Store
  const dispatch = useDispatch();

  const { bookingMetrics, loading, error } = useSelector(
    (state) => state.adminReportData,
  );

  useEffect(() => {
    dispatch(fetchAdminBookingMetrics());
  }, [dispatch]);

  // const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredVehicles = vehicleData.specificVehicleDetails.filter((v) => {
    const matchSearch = v.vehicleNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && v.vehicleStatus) ||
      (statusFilter === "unavailable" && !v.vehicleStatus);
    return matchSearch && matchStatus;
  });

  const handleActionType = (actionType) => {
    navigate("/action", {
      state: {
        type: actionType,
      },
    });
  };

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <div className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.navTabs}>
            <button
              className={
                activeView === "dashboard" ? styles.activeTab : styles.tab
              }
              onClick={() => setActiveView("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={
                activeView === "vehicles" ? styles.activeTab : styles.tab
              }
              onClick={() => setActiveView("vehicles")}
            >
              Vehicle Services
            </button>
          </div>
          {activeView === "vehicles" && (
            <button className={styles.primaryBtn}>
              <Plus size={18} /> New
            </button>
          )}
        </div>
      </div>

      <div className={styles.container}>
        {activeView === "dashboard" ? (
          <>
            {/* KPI CARDS */}
            <div className={styles.kpiGrid}>
              <div className={`${styles.kpiCard} ${styles.blue}`}>
                <DollarSign />
                <h4>Total Revenue</h4>
                <p>{bookingMetrics.totalRevenue} </p>
              </div>
              {/* ==== Fetch Booking List */}
              <BookingDataList />
              {/* ==== Fetch Vehicle Inventory List */}

              <VehicleInventoryReport />
              {/* ==== Fetch All user data List */}

              <UserDataList />
            </div>

            {/* CHARTS */}
            <div className={styles.chartGrid}>
              <div className={styles.card}>
                <h3>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.card}>
                <h3>Booking Status from</h3>
                <BookingStatusData />
              </div>
              <div className={styles.card}>
                <h3>Vehicle Status</h3>
                <VehicleListData />
              </div>
            </div>

            {/* NOTIFICATIONS */}
            {/* <div className={styles.card}>
              <h3>
                Notifications{" "}
                {unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount}</span>
                )}
              </h3>

              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={n.unread ? styles.notifyUnread : styles.notify}
                >
                  <Bell size={16} />
                  <div>
                    <p>{n.message}</p>
                    <small>{n.time}</small>
                  </div>
                </div>
              ))}
            </div> */}
          </>
        ) : (
          <>
            {/* VEHICLE TABLE */}
            <div className={styles.card}>
              <div className={styles.tableControls}>
                <div className={styles.searchBox}>
                  <Search size={18} />
                  <input
                    placeholder="Search vehicle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v, i) => (
                    <tr key={i}>
                      <td>{v.vehicleNumber}</td>
                      <td>
                        {v.vehicleStatus ? (
                          <span className={styles.available}>
                            <CheckCircle size={14} /> Available
                          </span>
                        ) : (
                          <span className={styles.unavailable}>
                            <XCircle size={14} /> Unavailable
                          </span>
                        )}
                      </td>
                      <td>{formatDate(v.createdAt)}</td>
                      <td className={styles.actions}>
                        <Eye size={16} />
                        <Edit size={16} />
                        <Trash2 size={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeView === "dashboard" && (  <div className={styles.quickActions}>
          <h2 className={styles.quickTitle}>Quick Actions</h2>
          <div className={styles.quickGrid}>
            <button
              className={`${styles.quickBtn} ${styles.bgBlueLight}`}
              onClick={() => handleActionType("vehicle_handover")}
            >
              <Calendar className={`${styles.quickIcon} ${styles.textBlue}`} />
              <p className={styles.quickLabel}>New Booking</p>
            </button>
            <button
              className={`${styles.quickBtn} ${styles.bgGreenLight}`}
              onClick={() => handleActionType("dl_verification_list")}
            >
              <Lock className={`${styles.quickIcon} ${styles.textGreen}`} />
              <p className={styles.quickLabel}>DL Verification</p>
            </button>
            <button className={`${styles.quickBtn} ${styles.bgPurpleLight}`}>
              <User className={`${styles.quickIcon} ${styles.textPurple}`} />
              <p className={styles.quickLabel}>Profile</p>
            </button>
            <button
              className={`${styles.quickBtn} ${styles.bgOrangeLight}`}
              onClick={() => handleActionType("audit_logs")}
            >
              <Bell className={`${styles.quickIcon} ${styles.textOrange}`} />
              <p className={styles.quickLabel}>Alerts</p>
            </button>
          </div>
        </div>)}

      
      </div>
    </div>
  );
};

export default AdminDashboard;
