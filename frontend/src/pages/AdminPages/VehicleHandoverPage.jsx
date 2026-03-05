import React, { useEffect, useCallback } from "react";
import styles from "./adminPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, CheckCircle } from "lucide-react";

import { fetchReportBookingData } from "../../appRedux/redux/reportSlice/adminReportSlice";
import { CompletedRideBookingData } from "../../appRedux/redux/bookingSlice/vehicleBookingSlice";
import { formatDate } from "../../utils/formatDate";

const VehicleHandoverPage = () => {
  const dispatch = useDispatch();

  /* ---------- Selectors ---------- */
  const bookings =
    useSelector((state) => state.adminReportData?.bookingList) || [];

  const {
    updateCompleteBookingResponse,
    updateCompleteBookingLoading,
    updateCompleteBookingError,
  } = useSelector((state) => state.bookingData);

  /* ---------- Fetch bookings ---------- */
  useEffect(() => {
    dispatch(fetchReportBookingData());
  }, [dispatch]);

  /* ---------- Handle booking completion ---------- */
  const handleCompleteBooking = useCallback(
    (bookingId) => {
      if (!bookingId || updateCompleteBookingLoading) return;

      dispatch(
        CompletedRideBookingData({
          bookingId,
          bookingStatus: "completed",
        }),
      );
    },
    [dispatch, updateCompleteBookingLoading],
  );

  /* ---------- Post completion handling ---------- */
  useEffect(() => {
    if (updateCompleteBookingResponse) {
      // Refresh list after completion
      dispatch(fetchReportBookingData());
    }

    if (updateCompleteBookingError) {
      console.error("Completion error:", updateCompleteBookingError);
    }
  }, [updateCompleteBookingResponse, updateCompleteBookingError, dispatch]);

  /* ---------- Filter only confirmed bookings ---------- */
  const activeBookings = bookings.filter(
    (val) => val.bookingStatus === "confirmed",
  );

  if (activeBookings.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty}>
          <Calendar size={48} />
          <h3>No Active Bookings Found</h3>
          <p>All bookings have been completed or none are active right now.</p>
        </div>
      </div>
    );
  }

  console.log("Active Bookings:", activeBookings);

  return (
    <>
      <div className={styles.main_container}>
        <p className={styles.pageTitle}>Vehicle Handover / Completion</p>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Booking ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Vehicle</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {activeBookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td>{index + 1}</td>
                  <td>{booking.uniqueBookingId}</td>
                  <td>{booking.userDetails[0]?.name}</td>
                  <td>{booking.userDetails[0]?.email}</td>
                  <td>{booking.userDetails[0]?.phoneNumber}</td>
                  <td>{booking?.vehicleDetails?.vehicleNumber}</td>
                  <td>{formatDate(booking.pickupDate)}</td>
                  <td>{formatDate(booking.dropOffDate)}</td>
                  <td>₹{booking.totalPrice}</td>

                  <td>
                    <span className={styles.activeBadge}>Confirmed</span>
                  </td>

                  <td className={styles.actionCell}>
                    <button
                      className={styles.completeBtn}
                      disabled={updateCompleteBookingLoading}
                      onClick={() =>
                        handleCompleteBooking(booking.uniqueBookingId)
                      }
                    >
                      <CheckCircle size={18} />
                      {updateCompleteBookingLoading
                        ? "Processing..."
                        : "Complete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* {!activeBookings.length && (
            <div className={styles.emptyState}>No active bookings found</div>
          )} */}
        </div>
      </div>
    </>
  );
};

export default VehicleHandoverPage;
