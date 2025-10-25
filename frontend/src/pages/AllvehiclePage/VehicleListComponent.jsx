import { useState } from "react";
import VehiclePageStyle from "./Vehicle.module.css";
import ButtonStyle from "../../Css/button.module.css";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../ContextApi/ToastContext";

import { Clock, ChevronRight, AlertCircle, Shield } from "lucide-react";

const VehicleListComponent = ({
  ListOfVehicle,
  startDate,
  EndDate,
  userData,
}) => {
  const { handleShowToast } = useToast();

  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedPriceAndRangeValue, setSelectedPriceAndRangeValue] =
    useState(null);
  const navigate = useNavigate();

  const handleBooking = (SelectedVehicleDetails, checkValue) => {
    if (checkValue === "LOGIN & BOOK" || userData === null) {
      navigate("/login");
      handleShowToast("danger", "Please login to book a vehicle");
      return;
    }

    if (!startDate || !EndDate) {
      handleShowToast("danger", "Please select start and end date");
      return;
    }
    if (!selectedPriceAndRangeValue) {
      handleShowToast("danger", "Please select a price option");
      return;
    }

    navigate("/booking", {
      state: {
        SelectedVehicleDetails,
        startDate,
        EndDate,
        selectedPriceAndRangeValue,
        userData,
      },
    });
  };

  const handleGetSelectedPriceOption = (selectId, priceAndRangeValue) => {
    setSelectedOption(selectId);
    setSelectedPriceAndRangeValue(priceAndRangeValue);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <div className={VehiclePageStyle.vehicle_rental_showcase}>
        <main className={VehiclePageStyle.main_container}>
          <div className={VehiclePageStyle.vehicle_grid}>
            {ListOfVehicle &&
              ListOfVehicle.length > 0 &&
              ListOfVehicle.map((elem, index) => {
                return (
                  <div key={index} className={VehiclePageStyle.vehicle_card}>
                    <div className={VehiclePageStyle.vehicle_image_container}>
                      {elem.filePath && elem.filePath.length > 0 && (
                        <img
                          src={`${Server_API}${elem.filePath[0]}`} // Prepend base URL to filePath
                          alt="VehicleImage"
                        />
                      )}
                      <div className={VehiclePageStyle.available_badge}>
                        {
                          elem.specificVehicleDetails.filter((vehicle) => {
                            if (!vehicle.vehicleStatus) return false;

                            const userStart = startDate
                              ? new Date(startDate)
                              : null;
                            const userEnd = EndDate ? new Date(EndDate) : null;

                            if (!userStart || !userEnd) return true; // If dates not selected

                            const isAvailable = vehicle.bookedPeriods.every(
                              (period) => {
                                const bookedStart = new Date(
                                  period.startDate
                                ).getTime();
                                const bookedEnd = new Date(
                                  period.endDate
                                ).getTime();

                                const userStartTime = userStart.getTime();
                                const userEndTime = userEnd.getTime();

                                return (
                                  userEndTime <= bookedStart ||
                                  userStartTime >= bookedEnd
                                );
                              }
                            );

                            return isAvailable; // ✅ You forgot this
                          }).length
                        }{" "}
                        Left
                      </div>

                      <div className={VehiclePageStyle.vehicle_name_overlay}>
                        {elem.name}
                      </div>
                    </div>

                    <div className={VehiclePageStyle.vehicle_content}>
                      {/* Date Range */}
                      <div className={VehiclePageStyle.date_range}>
                        <div>
                          <p>Pickup:</p>
                          <p>{formatDate(startDate)}</p>
                          <p>{elem.bookingId}</p>
                        </div>
                        <ChevronRight className="chevron" />
                        <div>
                          <p>Drop-off:</p>
                          <p>{formatDate(EndDate)}</p>
                          <p>{elem.bookingId}</p>
                        </div>
                      </div>

                      {/* Pricing Options */}
                      <div className={VehiclePageStyle.pricing_section}>
                        <p>
                          <Clock className={VehiclePageStyle.icon} />
                          KM LIMITS:
                        </p>
                        <div className={VehiclePageStyle.pricing_grid}>
                          {elem.bookingPrice.map((val) => (
                            <button
                              key={val._id}
                              className={`${VehiclePageStyle.pricing_btn} ${
                                selectedOption === val._id
                                  ? VehiclePageStyle.selected
                                  : ""
                              }`}
                              onClick={(e) =>
                                handleGetSelectedPriceOption(val._id, val)
                              }
                            >
                              <p>Km: {val.range}</p>
                              <p>₹{val.price}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className={VehiclePageStyle.additional_info}>
                        <div>
                          <AlertCircle className="icon" />
                          <span>
                            Excess km charges: ₹{elem.excessCharge}/km
                          </span>
                        </div>
                        <div>
                          <Shield className="icon" />
                          <span>
                            Refundable security deposit: ₹{elem.securityDeposit}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={ButtonStyle.Button_Container}>
                        <button
                          className={ButtonStyle.Button_Container_content}
                          onClick={() =>
                            handleBooking(
                              elem,
                              !userData ? "LOGIN & BOOK" : "Book Now"
                            )
                          }
                        >
                          {!userData ? "LOGIN & BOOK" : "Book Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </main>
      </div>
    </>
  );
};

export default VehicleListComponent;
