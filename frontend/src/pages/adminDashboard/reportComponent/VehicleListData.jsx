import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  fetchAvailableVehicleData,
  fetchNotAvailableVehicleData,
} from "../../../appRedux/redux/reportSlice/adminReportSlice";
import styles from "../DashBoard.module.css";
import {
  CheckCircle,
  XCircle,
  // Edit,
  // Trash2,
  // Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ----------------- helpers ----------------- */

const getCount = (vehicles = []) =>
  vehicles.reduce(
    (sum, item) => sum + (item.specificVehicleDetailsCount || 0),
    0
  );

/* ----------------- sub components ----------------- */

const AvailabilityPieChart = ({ availableVehicles, notAvailableVehicles }) => {
  const chartData = [
    {
      name: "Available",
      value: getCount(availableVehicles),
      color: "#22c55e",
    },
    {
      name: "Not Available",
      value: getCount(notAvailableVehicles),
      color: "#ef4444",
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          dataKey="value"
          nameKey="name"
          outerRadius={100}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

const VehicleList = ({ title, vehicles = [], dotColor }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  if (!vehicles.length) return null;

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-3" style={{ color: dotColor }}>
        {title}
      </h4>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((group) => {
              const groupKey = `${group.vehicleType}-${group.model}`;

              return (
                <React.Fragment key={groupKey}>
                  {/* GROUP HEADER */}
                  <tr colSpan="2"
                    className={styles.groupRow}
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <td colSpan="2" className={styles.groupHeader}>
                      {group.vehicleType} • {group.model}
                      <span className={styles.expandIcon}>
                        {expandedGroups[groupKey] ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </span>
                    </td>
                  </tr>

                  {/* VEHICLES */}
                  {expandedGroups[groupKey] &&
                    (group.specificVehicleDetails || []).map((v) => (
                      <tr key={v.uniqueVehicleId || v.vehicleNumber}>
                        <td className={styles.subVehicle}>{v.vehicleNumber}</td>
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
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ----------------- main component ----------------- */

const VehicleListData = () => {
  const {
    availableVehicles = [],
    notAvailableVehicles = [],
    loading,
    error,
  } = useSelector((state) => state.adminReportData);

  const [showVehicleLists, setShowVehicleLists] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAvailableVehicleData());
    dispatch(fetchNotAvailableVehicleData());
  }, [dispatch]);

  if (loading) return <div>Loading vehicle data...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl p-6">
      {/* PIE CHART */}
      <AvailabilityPieChart
        availableVehicles={availableVehicles}
        notAvailableVehicles={notAvailableVehicles}
      />

      {/* TOGGLE HEADER FOR LISTS */}
      <div
        className={styles.sectionHeader}
        onClick={() => setShowVehicleLists((prev) => !prev)}
      >
        <h4 className={styles.sectionTitle}>Vehicle Details</h4>
        <span className={styles.expandIcon}>
          {showVehicleLists ? <ChevronUp /> : <ChevronDown />}
        </span>
      </div>

      {/* LISTS → TOGGLED */}
      {showVehicleLists && (
        <>
          <VehicleList
            title="Available Vehicles"
            vehicles={availableVehicles}
            dotColor="#22c55e"
          />

          <VehicleList
            title="Not Available Vehicles"
            vehicles={notAvailableVehicles}
            dotColor="#ef4444"
          />
        </>
      )}
    </div>
  );
};

export default VehicleListData;
