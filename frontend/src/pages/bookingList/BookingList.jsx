import React, { useEffect, useState } from "react";
import BookingListComponent from "./BookingListComponent";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";
import api from "../../axiosInterceptors/AxiosSetup";


const BookingList = () => {
  const { handleShowToast } = useToast();
  const [AllBookingDetails, setAllBookingDetails] = useState([]);

  const fetchBookingsDetails = async () => {
    try {
      const response = await api.get(`${Server_API}/getBookingdetails`, {
        withCredentials: true,
      });
      setAllBookingDetails(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setAllBookingDetails([]);
      handleShowToast("danger", "Failed to fetch details");
    } finally {
    }
  };

  useEffect(() => {
    fetchBookingsDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* {isLoading ? (
        <Preloader />
      ) : ( */}
        <div style={{ width: "100%", height: "100%" }}>
          <BookingListComponent
            bookingList={AllBookingDetails}
            fetchBookingsDetails={fetchBookingsDetails}
          />
        </div>
      {/* )} */}
    </>
  );
};

export default BookingList;
