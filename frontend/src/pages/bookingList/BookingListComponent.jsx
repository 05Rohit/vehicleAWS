import styles from "./BookingList.module.css";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { useState } from "react";
import ButtonStyle from "../../Css/button.module.css";
import { Server_API } from "./../../APIPoints/AllApiPonts";
import Preloader from "../../preLoader/Preloader";
import { useToast } from "../../ContextApi/ToastContext";
import api from "../../axiosInterceptors/AxiosSetup";

// Helper function to format date as DD-MM-YYYY HH:mm

const BookingListComponent = ({ bookingList, fetchBookingsDetails }) => {
  const { handleShowToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

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
  const [filter, setFilter] = useState("all");

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
  const handleCancelBooking = async (bookingId) => {
    setIsLoading(true);
    try {
      await api.patch(
        `${Server_API}/updateBookingDetails`,
        { uniqueBookingId: bookingId, bookingStatus: "cancelled" },
        {
          withCredentials: true,
        }
      );

      fetchBookingsDetails();
      setIsLoading(false);
    } catch (error) {
      handleShowToast("danger", "Facing error, Try again");
      setIsLoading(false);
      console.error("Error cancelling booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookingList
      : bookingList.filter((v) => v.bookingStatus === filter);

  return (
    <>
      {isLoading ? (
        <Preloader />
      ) : (
        <div className={styles.container}>
          <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>My Bookings</h1>
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
              {filteredBookings.map((booking, index) => (
                <div key={index} className={styles.bookingCard}>
                  <div
                    className={`${styles.bookingHeader} ${getStatusClass(
                      booking.bookingStatus
                    )}`}
                  >
                    <div className={styles.statusLeft}>
                      {getStatusIcon(booking.bookingStatus)}
                      <span>{booking.bookingStatus}</span>
                    </div>
                    <span className={styles.bookingId}>
                      #{booking.uniqueBookingId}
                    </span>
                  </div>

                  <div className={styles.bookingBody}>
                    <div className={styles.bookingBody_box}>
                      {filteredBookings.filePath && filteredBookings.filePath.length > 0 && (
                        <img
                          src={`${Server_API}${filteredBookings.filePath[0]}`} // Prepend base URL to filePath
                          alt="VehicleImage"
                          className={filteredBookings.bikeImage}
                        />
                      )}

                      <div className={styles.details}>
                        <p>
                          <MapPin size={16} /> {booking.location}
                        </p>
                        <p>
                          <Calendar size={16} />{" "}
                          {formatDate(booking.pickupDate)} -{" "}
                          {formatDate(booking.dropOffDate)}
                        </p>
                        <p>
                          <Clock size={16} /> {booking.vehicleMilage} km/day
                        </p>
                      </div>
                    </div>

                    <h3>{booking.name}</h3>
                    <p>{booking.vehicleNumber}</p>
                    <div className={styles.booking_info}>
                      <div className={styles.priceBox}>
                        <p>Base Price: ₹{booking.price}</p>
                        <p>
                          Tax ({booking.tax}%): ₹
                          {(booking.totalPrice - booking.price).toFixed(2)}
                        </p>
                        <p>Total: ₹{booking.totalPrice}</p>
                      </div>
                    </div>
                  </div>
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
