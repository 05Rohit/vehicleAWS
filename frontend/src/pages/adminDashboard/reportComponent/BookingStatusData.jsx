import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { fetchAdminBookingMetrics } from "../../../appRedux/redux/reportSlice/adminReportSlice";

const BOOKING_STATUS_CONFIG = {
  active: { label: "Active", color: "#3b82f6" },
  upcoming: { label: "Upcoming", color: "#10b981" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  confirmed: { label: "Confirmed", color: "#6366f1" },
  completed: { label: "Completed", color: "#22c55e" },
};

const BookingStatusData = () => {
  const dispatch = useDispatch();

  const { bookingMetrics, loading, error } = useSelector(
    (state) => state.adminReportData
  );
  

  useEffect(() => {
    dispatch(fetchAdminBookingMetrics());
  }, [dispatch]);

  const bookingStatusData = useMemo(() => {
    if (!bookingMetrics?.bookingStatusStats) return [];

    return bookingMetrics.bookingStatusStats.map((item) => {
      const config = BOOKING_STATUS_CONFIG[item._id] || {
        label: item._id,
        color: "#9ca3af",
      };

      return {
        name: config.label,
        value: item.count,
        color: config.color,
      };
    });
  }, [bookingMetrics]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!bookingStatusData.length) return <p>No data</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={bookingStatusData}
          cx="50%"
          cy="50%"
          dataKey="value"
          nameKey="name"
          innerRadius={0}
          outerRadius={100}
          paddingAngle={0}
        >
          {bookingStatusData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BookingStatusData;
