import React, { useEffect, useState } from "react";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";
import GroupPageStyle from "./GroupVehicleUpdate.module.css";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";
import CustomStyle from "../addVehicle/CustomAddVehicle.module.css";

import {
  MapPin,
  Activity,
  Hash,
  Save,
  X,
  DollarSign,
  Edit2,
} from "lucide-react";
import api from "../../axiosInterceptors/AxiosSetup";
const VechicleGroupUpadtesModel = ({
  selectedGroup,
  handleGroupClose,
  handleGetAllVehicleList,
}) => {
  const { handleShowToast } = useToast();

  console.log("Selected Group:", selectedGroup);

  const [formData, setFormData] = useState({
    name: selectedGroup.name,
    model: selectedGroup.model,
    vehicleType: selectedGroup.vehicleType,
  });
  const [isEditing, setIsEditing] = useState(false);

  const [bookingPrice, setBookingPrice] = useState([{ range: "", price: "" }]);
  useEffect(() => {
    if (selectedGroup?.bookingPrice?.length > 0) {
      setBookingPrice(
        selectedGroup.bookingPrice.map((item) => ({
          range: item.range || "",
          price: item.price || "",
          _id: item._id || undefined,
        }))
      );
    } else {
      setBookingPrice([{ range: "", price: "" }]);
    }
    // eslint-disable-next-line
  }, []);

  const handleBookingPriceChange = (index, field, value) => {
    const updated = [...bookingPrice];
    updated[index][field] = value.replace(/\D/g, ""); // Only allow numbers
    setBookingPrice(updated);
  };

  const handleAddBookingPrice = () => {
    setBookingPrice([...bookingPrice, { range: "", price: "" }]);
  };

  const handleUpdateVehicleDetails = async (vehicleId) => {
    const updatedVehicle = {
      ...formData,
      bookingPrice: bookingPrice,
    };

    try {
      await api.patch(
        `${Server_API}/updatevehiclegroup/${vehicleId}`,
        updatedVehicle,
        {
          withCredentials: true,
        }
      );
      handleGetAllVehicleList();
      handleShowToast("success", "Vehicle updated successfully");
      handleGroupClose();
    } catch (error) {
      const ErrMessage =
        error.response?.data?.error || "Error updating vehicle";
      handleShowToast("danger", ErrMessage);
    }
  };

  const handleRemoveBookingPrice = (index) => {
    if (bookingPrice.length === 1) return;
    setBookingPrice(bookingPrice.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    handleUpdateVehicleDetails(selectedGroup.uniqueGroupId);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: selectedGroup.name,
      model: selectedGroup.model,
      vehicleType: selectedGroup.vehicleType,
    });
    setIsEditing(false);
  };
  return (
    <>
      <div className={GroupPageStyle.gridContainer}>
        {/* Left Column */}
        <div className={GroupPageStyle.leftCard}>
          <div className={GroupPageStyle.leftHeader}>
            <h3>Vehicle Info</h3>
            <p>Read-only details</p>
          </div>
          <div className={GroupPageStyle.leftContent}>
            <div className={GroupPageStyle.imageContainer}>
              {selectedGroup.filePath && selectedGroup.filePath.length > 0 && (
                <img
                  src={`${Server_API}${selectedGroup.filePath[0]}`} // Prepend base URL to filePath
                  alt="VehicleImage"
                />
              )}
           
            </div>

            <div className={GroupPageStyle.infoBlock}>
              <div>
                <p className={GroupPageStyle.label}>Vehicle Name</p>
                <p className={GroupPageStyle.value}>{selectedGroup.name}</p>
              </div>

              <div>
                <p className={GroupPageStyle.label}>Model</p>
                <p className={GroupPageStyle.value}>{selectedGroup.model}</p>
              </div>

              <div>
                <p className={GroupPageStyle.label}>Type</p>
                <p className={GroupPageStyle.value}>
                  {selectedGroup.vehicleType}
                </p>
              </div>

              <div>
                <p className={GroupPageStyle.label}>Unique Group ID</p>
                <p className={GroupPageStyle.monoValue}>
                  {selectedGroup.uniqueGroupId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={`${GroupPageStyle.rightCard}`}>
          <div className={GroupPageStyle.rightHeader}>
            <div>
              <h3>Specific Vehicle Details</h3>
              <p>Edit location, status, and mileage information</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={GroupPageStyle.editButton}
              >
                <Edit2 className={GroupPageStyle.buttonIcon} />
                Edit
              </button>
            )}
          </div>

          <div className={`${FormStyles.form} ${CustomStyle.form_body} `}>
            {/* Vehicle Name */}
            <div className={FormStyles.form_group}>
              <label htmlFor="name">
                <MapPin /> Vehicle Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange(e)}
                disabled={!isEditing}
                className={` ${
                  isEditing
                    ? GroupPageStyle.inputActive
                    : GroupPageStyle.inputDisabled
                }`}
                placeholder="Enter New Name"
              />
            </div>

            {/* Vehicle Model */}
            <div className={FormStyles.form_group}>
              <label htmlFor="model">
                <Hash className={FormStyles.icon_amber} /> Vehicle Model
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={(e) => handleInputChange(e)}
                disabled={!isEditing}
                className={` ${
                  isEditing
                    ? GroupPageStyle.inputActive
                    : GroupPageStyle.inputDisabled
                }`}
                placeholder="Enter vehicle number"
              />
            </div>

            {/* Vehicle Type */}
            <div className={FormStyles.form_group}>
              <label>
                <Activity className={FormStyles.icon_amber} /> Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={(e) => handleInputChange(e)}
                disabled={!isEditing}
                className={`${
                  isEditing
                    ? GroupPageStyle.inputActive
                    : GroupPageStyle.inputDisabled
                }`}
              >
                <option value="">Select Vehicle Type</option>
                <option value="Bike">Bike</option>
                <option value="Scooty">Scooty</option>
              </select>
            </div>

            <div className={FormStyles.form_group}>
              <div className={CustomStyle.price_header}>
                <label>
                  <DollarSign className={FormStyles.icon_amber} /> Booking Price{" "}
                  <span>*</span>
                </label>
                {bookingPrice.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddBookingPrice}
                    className={CustomStyle.add_range_btn}
                  >
                    + Add Range
                  </button>
                )}
              </div>

              {bookingPrice.map((range, index) => (
                <div key={index} className={CustomStyle.price_row}>
                  <input
                    type="text"
                    placeholder="Range in KM"
                    value={range.range}
                    onChange={(e) =>
                      handleBookingPriceChange(index, "range", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={range.price}
                    onChange={(e) =>
                      handleBookingPriceChange(index, "price", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBookingPrice(index)}
                      className={CustomStyle.remove_btn}
                    >
                      −
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Not Available Reason */}

            {/* Action Buttons */}
            {isEditing && (
              <div
                className={`${ButtonStyle.Button_Container} ${GroupPageStyle.actionButtons}`}
              >
                <button
                  onClick={handleSave}
                  className={GroupPageStyle.saveButton}
                >
                  <Save /> Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className={GroupPageStyle.cancelButton}
                >
                  <X /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VechicleGroupUpadtesModel;
