import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../DashBoard.module.css";
import { fetchReportBookingData } from "../../../appRedux/redux/reportSlice/adminReportSlice";
import { Calendar, X } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";



const statusPriority = {
  confirmed: 1,
  cancelled: 2,
  completed: 3,
};

const BookingDataList = () => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const dispatch = useDispatch();

  const bookings = useSelector(
    (state) => state.adminReportData?.bookingList || []
  );

  useEffect(() => {
    dispatch(fetchReportBookingData());
  }, [dispatch]);

  /* Handle Close the Model with effect */
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200); // must match animation duration
  };

  /* ---------------- KPI COUNT (ONLY CONFIRMED) ---------------- */
  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.bookingStatus === "confirmed").length,
    [bookings]
  );

  /* ---------------- SORTED DATA FOR MODAL ---------------- */
  const sortedBookings = useMemo(() => {
    return [...bookings]
      .filter((b) =>
        ["confirmed", "cancelled", "completed"].includes(b.bookingStatus)
      )
      .sort(
        (a, b) =>
          statusPriority[a.bookingStatus] - statusPriority[b.bookingStatus]
      );
  }, [bookings]);

  return (
    <>
      {/* KPI CARD (USED IN PARENT GRID) */}

      <div
        className={`${styles.kpiCard} ${styles.green}`}
        onClick={() => setOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <Calendar />
        <h4>Active Bookings</h4>
        <p>{confirmedCount}</p>
      </div>

      {/* MODAL */}
      {open && (
        <div
          className={`${styles.modalOverlay} ${closing ? styles.closing : ""}`}
        >
          <div className={`${styles.modal} ${closing ? styles.closing : ""}`}>
            <div className={styles.groupHeader}>
              <h4>Booking Details</h4>
              <button onClick={() => handleClose()}>
                {" "}
                <X />
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sl No.</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Pickup</th>
                    <th>Drop-off</th>
                    <th>Vehicle Name</th>
                    <th>Model</th>
                    <th>Number</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedBookings.map((b, index) => (
                    <tr key={b._id}>
                      <td>{index + 1}</td>
                      <td>{b.userDetails?.[0]?.name}</td>
                      <td>{b.userEmail}</td>

                      <td>
                        <span
                          className={
                            b.bookingStatus === "confirmed"
                              ? styles.available
                              : b.bookingStatus === "cancelled"
                              ? styles.cancelled
                              : styles.completed
                          }
                        >
                          {b.bookingStatus}
                        </span>
                      </td>

                      <td>{formatDate(b.pickupDate)}</td>
                      <td>{formatDate(b.dropOffDate)}</td>
                      <td>{b.vehicleDetails.name}</td>
                      <td>{b.vehicleDetails.model}</td>
                      <td>{b.vehicleDetails.vehicleNumber}</td>
                      <td>
                        <strong>₹{b.totalPrice}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!sortedBookings.length && (
                <div className={styles.emptyState}>No booking data found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingDataList;
