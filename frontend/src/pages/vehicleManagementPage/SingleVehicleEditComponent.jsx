import React, { useState } from "react";
import CustomStyle from "./EditSingleVehicle.module.css";
import FormStyle from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";
import {
  MapPin,
  Activity,
  Hash,
  AlertCircle,
  Save,
  X,
  CheckCircle,
  Edit2,
} from "lucide-react";

const SingleVehicleEditComponent = ({ data, onChange, submit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const status = data.vehicleStatus;
  const [showVehicleStatus, setShowVehicleStatus] = useState(status);

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    const parsedValue = value === "true"; // Convert string → boolean


    if (name === "vehicleStatus") {
      setShowVehicleStatus(parsedValue);
      onChange({ ...data, [name]: parsedValue }); // ✅ use boolean
    } else {
      onChange({ ...data, [name]: value });
    }
  };


  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <div className={CustomStyle.rightCard}>
        <div className={CustomStyle.rightHeader}>
          <div>
            <h4>Specific Vehicle Details</h4>
            <p>Edit location, status, and mileage information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className={CustomStyle.editButton}
            >
              <Edit2 size={16} />
              Edit
            </button>
          )}
        </div>

        <div className={`${FormStyle.form} ${CustomStyle.formContainer}`}>
          {/* Location */}
          <div className={FormStyle.form_group}>
            <label htmlFor="location">
              <MapPin size={16} /> Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={data.location}
              onChange={(e) => handleInputChange(e)}
              disabled={!isEditing}
              className={`${CustomStyle.input} ${
                isEditing ? CustomStyle.inputActive : CustomStyle.inputDisabled
              }`}
              placeholder="Enter location"
            />
          </div>

          {/* Vehicle Number */}
          <div className={FormStyle.form_group}>
            <label htmlFor="vehicleNumber">
              <Hash size={16} /> Vehicle Number
            </label>
            <input
              type="text"
              name="vehicleNumber"
              id="vehicleNumber"
              value={data.vehicleNumber}
              onChange={(e) => handleInputChange(e)}
              disabled={!isEditing}
              className={`${CustomStyle.input} ${
                isEditing ? CustomStyle.inputActive : CustomStyle.inputDisabled
              }`}
              placeholder="Enter vehicle number"
            />
          </div>

          {/* Vehicle Mileage */}
          <div className={FormStyle.form_group}>
            <label htmlFor="vehicleMilage">
              <Activity size={16} /> Vehicle Mileage (km/day)
            </label>
            <input
              type="number"
              name="vehicleMilage"
              id="vehicleMilage"
              value={data.vehicleMilage}
              onChange={(e) => handleInputChange(e)}
              disabled={!isEditing}
              className={`${CustomStyle.input} ${
                isEditing ? CustomStyle.inputActive : CustomStyle.inputDisabled
              }`}
              placeholder="Enter mileage"
            />
          </div>

          {/* Vehicle Status */}
          <div className={FormStyle.form_group}>
            <label>
              <CheckCircle size={16} /> Vehicle Status
            </label>
            <div className={`${ButtonStyle.Button_Container} ${CustomStyle.actionButtons}`}>
              <button
                type="button"
                name="vehicleStatus"
                value={true}
                onClick={(e) => isEditing && handleInputChange(e)}
                disabled={!isEditing}
                className={`${CustomStyle.statusButton} ${
                  showVehicleStatus === true ? CustomStyle.available : ""
                }`}
              >
                <CheckCircle /> Available
              </button>

              <button
                type="button"
                name="vehicleStatus"
                value={false}
                onClick={(e) => isEditing && handleInputChange(e)}
                disabled={!isEditing}
                className={`${CustomStyle.statusButton} ${
                  showVehicleStatus === false ? CustomStyle.unavailable : ""
                }`}
              >
                <X /> Unavailable
              </button>
            </div>
          </div>

          {/* Not Available Reason */}
          {(isEditing && showVehicleStatus===false) && (
            <div className={`${CustomStyle.reasonBox} ${FormStyle.form_group}`}>
              <label>
                <AlertCircle size={16} /> Reason for Unavailability
              </label>
              <textarea
                name="notAvailableReason"
                id="notAvailableReason"
                value={data.notAvailableReason? data.notAvailableReason : ""}
                onChange={(e) => handleInputChange(e)}
                disabled={!isEditing}
                className={`${CustomStyle.textarea} ${
                  (isEditing && showVehicleStatus===false)
                    ? CustomStyle.textareaActive
                    : CustomStyle.textareaDisabled
                }`}
                rows="3"
                placeholder="Enter reason why vehicle is not available"
              />
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className={`${ButtonStyle.Button_Container} ${CustomStyle.actionButtons}`}>
              <button
                onClick={() => submit(data.uniqueVehicleId)}
                className={CustomStyle.saveButton}
              >
                <Save /> Save Changes
              </button>
              <button
                onClick={handleCancel}
                className={CustomStyle.cancelButton}
              >
                <X /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SingleVehicleEditComponent;
