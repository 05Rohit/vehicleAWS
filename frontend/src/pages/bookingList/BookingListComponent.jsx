import styles from "./BookingList.module.css";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { useEffect, useState } from "react";
import ButtonStyle from "../../Css/button.module.css";
import Preloader from "../../preLoader/Preloader";
import { useToast } from "../../ContextApi/ToastContext";
import { useDispatch, useSelector } from "react-redux";
import {
  updateBookingData,
  getBookingListData,
  CompletedRideBookingData,
} from "./../../appRedux/redux/bookingSlice/vehicleBookingSlice";

const BookingListComponent = () => {
  const { handleShowToast } = useToast();
  const [filter, setFilter] = useState("all");

  const dispatch = useDispatch();
  /* Get loading state for updating booking for cancellation of booking*/
  const { updateBookingLoading } = useSelector((state) => state.bookingData);

  /* Get booking list data */
  const { bookingListData, bookingListLoading } = useSelector(
    (state) => state.bookingData
  );
  /* Get logged in user details */
  const { user } = useSelector((state) => state.login);

  /* Fetch booking list data on component mount */
  useEffect(() => {
    dispatch(getBookingListData());
  }, [dispatch]);

  /* Function to format date and time */
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      pad(date.getDate()) +
      "/" +
      pad(date.getMonth() + 1) +
      "/" +
      date.getFullYear() +
      "  " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  /* Function to get CSS class based on booking status */
  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return styles.confirmed;
      case "completed":
        return styles.completed;
      case "cancelled":
        return styles.cancelled;
      default:
        return styles.default;
    }
  };

  /* Function to get status icon based on booking status */
  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <Loader className={styles.iconSpin} />;
      case "completed":
        return <CheckCircle className={styles.icon} />;
      case "cancelled":
        return <XCircle className={styles.icon} />;
      default:
        return null;
    }
  };

  /* Function to handle booking cancellation */
  const handleCancelBooking = async (bookingId) => {
    try {
      const res = await dispatch(
        updateBookingData({
          bookingId,
          bookingStatus: "cancelled",
        })
      ).unwrap();
      dispatch(getBookingListData());
      handleShowToast("success", res);
    } catch (error) {
      handleShowToast("danger", error);
    }
  };
  /* Function to handle marking booking as completed */
  const handleCompleteBooking = async (bookingId) => {
    try {
      const res = await dispatch(
        CompletedRideBookingData({
          bookingId,
          bookingStatus: "completed",
        })
      ).unwrap();
      dispatch(getBookingListData());
      handleShowToast("success", res);
    } catch (error) {
      handleShowToast("danger", error);
    }
  };

  /* Filter bookings based on selected filter */
  const filteredBookings =
    filter === "all"
      ? bookingListData
      : bookingListData.filter((v) => v.bookingStatus === filter);

  return (
    <>
      {bookingListLoading || updateBookingLoading ? (
        <Preloader />
      ) : (
        <div className={styles.container}>
          <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>My Bookings</h1>
              <p>Manage and track your vehicle reservations</p>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
              {["all", "confirmed", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`${styles.filterButton} ${
                    filter === status ? styles.activeFilter : ""
                  }`}
                >
                  {status === "all"
                    ? "All"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Bookings */}
            <div className={styles.bookingsGrid}>
              {filteredBookings &&
                filteredBookings.map((booking) => (
                  <div key={booking._id} className={styles.bookingCard}>
                    <div
                      className={`${styles.bookingHeader} ${getStatusClass(
                        booking.bookingStatus
                      )}`}
                    >
                      <div className={styles.statusLeft}>
                        {getStatusIcon(booking.bookingStatus)}
                        <p>{booking.bookingStatus}</p>
                      </div>
                      <span className={styles.bookingId}>
                        #{booking.uniqueBookingId}
                      </span>
                    </div>

                    <div className={styles.bookingBody}>
                      <div className={styles.bookingBody_box}>
                        <div className={styles.image}>
                          {filteredBookings[0].filePath && (
                            <img
                              src={booking.filePath[0]} // Prepend base URL to filePath
                              alt="VehicleImage"
                            />
                          )}
                        </div>

                        <div className={styles.details}>
                          <p>
                            <MapPin size={18} className={styles.iconStyle} />{" "}
                            {booking.location}
                          </p>
                          <p>
                            <Calendar size={18} className={styles.iconStyle} />{" "}
                            {formatDate(booking.pickupDate)}
                            <br /> - {formatDate(booking.dropOffDate)}
                          </p>
                          <p>
                            <Clock size={18} className={styles.iconStyle} />{" "}
                            {booking.vehicleMilage} km/day
                          </p>
                        </div>
                      </div>

                      <h3 className={styles.VehicleName}>{booking.name}</h3>
                      <p className={styles.VehicleNumber}>
                        {booking.vehicleNumber}
                      </p>
                      <div className={styles.priceBox}>
                        <p className={styles.priceRow}>
                          <span className={styles.label}>Base Price:</span>
                          <span className={styles.value}>₹{booking.price}</span>
                        </p>

                        <p className={styles.priceRow}>
                          <span className={styles.label}>
                            Tax ({booking.tax}%):
                          </span>
                          <span className={styles.value}>
                            ₹{(booking.totalPrice - booking.price).toFixed(2)}
                          </span>
                        </p>

                        <p className={`${styles.priceRow} ${styles.totalRow}`}>
                          <span className={styles.totalLabel}>Total:</span>
                          <span className={styles.totalValue}>
                            ₹{booking.totalPrice}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className={styles.buttonContainer}>
                      {booking.bookingStatus === "confirmed" && (
                        <div
                          className={ButtonStyle.Button_Container}
                          style={{ marginTop: "1px", marginBottom: "10px" }}
                        >
                          <button
                            className={ButtonStyle.Button_Container_content}
                            onClick={() =>
                              handleCancelBooking(booking.uniqueBookingId)
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {user?.userType === "admin" &&
                        booking.bookingStatus === "confirmed" && (
                          <div
                            className={ButtonStyle.Button_Container}
                            style={{ marginTop: "1px", marginBottom: "10px" }}
                          >
                            <button
                              className={ButtonStyle.Button_Container_content}
                              onClick={() =>
                                handleCompleteBooking(booking.uniqueBookingId)
                              }
                            >
                              Completed
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
            </div>

            {filteredBookings.length === 0 && (
              <div className={styles.empty}>
                <Calendar size={48} />
                <h3>No Bookings Found</h3>
                <p>No bookings match your current filter.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingListComponent;
