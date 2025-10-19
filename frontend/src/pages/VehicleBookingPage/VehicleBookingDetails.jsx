import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  Shield,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

import customStyle from "./VehicleBooking.module.css";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";
import api from "../../axiosInterceptors/AxiosSetup";

const VehicleBookingDetails = () => {
  const { handleShowToast } = useToast();
  const location = useLocation();
  const {
    SelectedVehicleDetails,
    startDate,
    EndDate,
    selectedPriceAndRangeValue,
  } = location.state || {};

  const getDayDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get difference in milliseconds
    const diffTime = end.getTime() - start.getTime();

    // Convert to full days
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If both are same date or difference < 1, count as 1 day
    if (diffDays <= 0) diffDays = 1;

    return diffDays;
  };

  // Example usage

  const TotalDays = getDayDifference(startDate, EndDate);

  const [selectedHelmets, setSelectedHelmets] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const navigate = useNavigate(); // <-- Fix: call useNavigate as a hook

  // States
  const [taxPercentage] = useState(18);
  const [totalAmount, setTotalAmount] = useState(0);
  const [finalPayableAmount, setFinalPayableAmount] = useState(0);
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [AdditonalExpenditurePrice, setAdditonalExpenditurePrice] = useState(0);
  const [finalTaxAmount, setFinalTaxAmount] = useState(0);

  // Format Dates
  useEffect(() => {
    if (startDate && EndDate) {
      const formatDate = (date) =>
        new Date(date)
          .toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "UTC",
          })
          .replace(",", "");

      setBookingStartDate(formatDate(startDate));
      setBookingEndDate(formatDate(EndDate));
    }
  }, [startDate, EndDate]);

  // Calculate Total and Final Amount
  useEffect(() => {
    if (selectedPriceAndRangeValue?.price) {
      const basicPrice = selectedPriceAndRangeValue.price * TotalDays;
      const taxAmount = (basicPrice * taxPercentage) / 100;
      const total = basicPrice + taxAmount;
      setTotalAmount(total);
      setFinalTaxAmount(taxAmount);
      const PayAmount =Math.round(total);
      setFinalPayableAmount(PayAmount);
    }
  }, [selectedPriceAndRangeValue, taxPercentage]);

  // Add Helmet Charges
  useEffect(() => {
    let additionalCost = 0;
    if (selectedHelmets === 1) additionalCost = 100;
    else if (selectedHelmets === 2) additionalCost = 180;
    setFinalPayableAmount(totalAmount + additionalCost);
    setAdditonalExpenditurePrice(additionalCost);
  }, [selectedHelmets, totalAmount]);

  // Handle Booking
  const handleBooking = async () => {
    if (!agreeTerms) {
      handleShowToast("danger", "Please agree to the terms and conditions");
      return;
    }

    try {
      await api.post(
        `${Server_API}/addbooking`,
        {
          pickupDate: startDate,
          dropOffDate: EndDate,
          // pickupLocation: "abc",
          // dropOffLocation: "def",
          price: selectedPriceAndRangeValue.price,
          extraExpenditure: AdditonalExpenditurePrice,
          tax: taxPercentage,
          totalPrice: finalPayableAmount,
          uniqueGroupId: SelectedVehicleDetails.uniqueGroupId,
          bookingStatus: "confirmed",
        },
        { withCredentials: true }
      );
      handleShowToast("success", "Booking successful!");
      setTimeout(() => {
        navigate("/bookinglist");
      }, 1000);
    } catch (error) {
      console.error("Booking error:", error);
      const ErrorMessage = error.response.data.message || "Booking failed";
      handleShowToast("danger", ErrorMessage);
    }
  };

  const rentalDurationHours = (
    (new Date(EndDate) - new Date(startDate)) /
    (1000 * 60 * 60)
  ).toFixed(2);

  return (
    <>
      <div className={customStyle.pageContainer}>      

        {/* Main Content */}
        <main className={customStyle.main}>
          <div className={customStyle.pageTitle}>
            <h1>Payment</h1>
            <p>Complete your booking and payment details</p>
          </div>

          <div className={customStyle.grid}>
            {/* Left - Vehicle Details */}
            <div className={customStyle.vehicleDetails}>
              <div className={customStyle.card}>
                <div className={customStyle.cardHeaderOrange}>
                  <h3>Vehicle Details</h3>
                </div>

                <div className={customStyle.cardBody}>
                  <div className={customStyle.vehicleImage}>
                    {SelectedVehicleDetails.filePath &&
                    SelectedVehicleDetails.filePath.length > 0 ? (
                      <img
                        src={`${Server_API}${SelectedVehicleDetails.filePath[0]}`} // Prepend base URL to filePath
                        alt="VehicleImage"
                      />
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop"
                        alt="vehicle"
                      />
                    )}
                  </div>

                  <h2>Vehicle Name: {SelectedVehicleDetails?.name}</h2>

                  <div className={customStyle.bookingInfo}>
                    <div
                      className={`${customStyle.infoBox} ${customStyle.blue}`}
                    >
                      <Calendar />
                      <div>
                        <p>Start Date</p>
                        <span>{bookingStartDate}</span>
                      </div>
                    </div>

                    <div
                      className={`${customStyle.infoBox} ${customStyle.orange}`}
                    >
                      <Calendar />
                      <div>
                        <p>End Date</p>
                        <span>{bookingEndDate}</span>
                      </div>
                    </div>

                    <div
                      className={`${customStyle.infoBox} ${customStyle.green}`}
                    >
                      <Clock />
                      <div>
                        <p>Total Time</p>
                        <span>{`${rentalDurationHours} Hrs`}</span>
                      </div>
                    </div>

                    <div className={customStyle.priceGrid}>
                      <div className={customStyle.priceBox}>
                        <p>Basic Price</p>
                        <h4>₹{selectedPriceAndRangeValue?.price}</h4>
                      </div>
                      <div className={customStyle.priceBox}>
                        <p>Range</p>
                        <h4>{selectedPriceAndRangeValue?.range} km</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Payment */}
            <div className={customStyle.paymentColumn}>
              {/* Price Breakdown */}
              <div className={customStyle.card}>
                <div className={customStyle.cardHeaderBlue}>
                  <h3>Price Breakdown</h3>
                </div>
                <div className={customStyle.cardBody}>
                  <div className={customStyle.card_Box}>
                    <p>Basic Price</p>
                    <span>
                      <IndianRupee size={14} />
                      {selectedPriceAndRangeValue?.price}
                    </span>
                  </div>
                  <div className={customStyle.card_Box}>
                    <p>Tax</p>
                    <span>
                      <IndianRupee size={14} />
                      {`${finalTaxAmount}`}
                    </span>
                  </div>
                  <div className={customStyle.card_Box}>
                    <p>Total Amount</p>
                    <span>
                      <IndianRupee size={14} />
                      {totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Helmet Section */}
              <div className={customStyle.card}>
                <div className={customStyle.cardHeaderOrange}>
                  <h3>Helmets for Rent</h3>
                  <p>(Select number of helmets)</p>
                </div>

                <div className={customStyle.cardBody}>
                  <div className={customStyle.helmetGrid}>
                    {[0, 1, 2].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSelectedHelmets(num)}
                        className={`${customStyle.helmetBtn} ${
                          selectedHelmets === num
                            ? customStyle.activeHelmet
                            : ""
                        }`}
                      >
                        {selectedHelmets === num && (
                          <CheckCircle className={customStyle.checkIcon} />
                        )}
                        <p>
                          {num} Helmet{num > 1 ? "s" : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className={customStyle.card}>
                <button
                  className={customStyle.termsToggle}
                  onClick={() => setShowTerms(!showTerms)}
                >
                  <div className={customStyle.termsHeader}>
                    <Shield />
                    <h3>Terms and Conditions</h3>
                  </div>
                  <ChevronRight
                    className={`${customStyle.chevron} ${
                      showTerms ? customStyle.rotate : ""
                    }`}
                  />
                </button>

                {showTerms && (
                  <div className={customStyle.termsList}>
                    <p>• Security deposit will be refunded after inspection</p>
                    <p>• Return vehicle with same fuel level</p>
                    <p>• Damage will be charged separately</p>
                    <p>• Late return charges apply</p>
                  </div>
                )}

                <div className={customStyle.checkboxArea}>
                  <label>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                  </label>
                  <p>I agree to the terms and conditions</p>
                </div>
              </div>

              {/* Book Now */}
              <div className={customStyle.card}>
                <div className={customStyle.cardHeaderWhite}>
                  <span>Total Amount</span>
                  <strong>₹{finalPayableAmount}</strong>
                </div>
                <div className={customStyle.bookNowBtn_container}>
                  <button
                    className={`${customStyle.bookNowBtn} ${
                      !agreeTerms ? customStyle.disabled : ""
                    }`}
                    onClick={handleBooking}
                    disabled={!agreeTerms}
                  >
                    Book Now
                  </button>
                  {!agreeTerms && (
                    <p className={customStyle.alertMsg}>
                      <AlertCircle /> Please agree to terms and conditions
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VehicleBookingDetails;
