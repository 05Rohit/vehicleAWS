import { useState } from "react";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";
import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyles from "../../Css/button.module.css";
import CustomStyle from "./CustomAddVehicle.module.css";
import {
  Car,
  Calendar,
  Hash,
  Gauge,
  MapPin,
  Upload,
  DollarSign,
} from "lucide-react";
import api from "../../axiosInterceptors/AxiosSetup";

const AddVehicleDetails = () => {
  const { handleShowToast } = useToast();

  const [bookingPrice, setBookingPrice] = useState([{ range: "", price: "" }]);

  const handleBookingPriceChange = (index, field, value) => {
    const updated = [...bookingPrice];
    updated[index][field] = value.replace(/\D/g, ""); // Only allow numbers
    setBookingPrice(updated);
  };

  const handleAddBookingPrice = () => {
    setBookingPrice([...bookingPrice, { range: "", price: "" }]);
  };

  const handleRemoveBookingPrice = (index) => {
    if (bookingPrice.length === 1) return;
    setBookingPrice(bookingPrice.filter((_, i) => i !== index));
  };

  const [values, setValue] = useState({
    name: "",
    model: "",
    vehicleType: "",
    vehicleNumber: "",
    vehicleMilage: "",
    location: "",
  });

  const [photos, setPhotos] = useState([]);

  const handleValueChange = (e, category) => {
    const { value } = e.target;

    let updatedValue = value;
    if (category === "vehicleMilage" || category === "model") {
      updatedValue = value.replace(/\D/g, "");
    }
    setValue((prev) => ({
      ...prev,
      [category]: updatedValue,
    }));
  };

  const handlePhotoUpload = (event) => {
    const selectedPhotos = Array.from(event.target.files); // Convert FileList to Array
    setPhotos(selectedPhotos); // Update the state with the selected photos
  };

  const handleVehicleDetails = async () => {
    if (
      !values.name ||
      !values.model ||
      !values.vehicleType ||
      !values.vehicleNumber ||
      !values.vehicleMilage ||
      !values.location ||
      bookingPrice.some((bp) => !bp.range || !bp.price)
    ) {
      handleShowToast("danger", "Please fill all the fields");
      return;
    }
    const formData = new FormData();

    // Append text values from the state
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });

    // Append photos (files) to FormData
    formData.append("bookingPrice", JSON.stringify(bookingPrice));
    photos.forEach((photo) => {
      formData.append("files", photo); // Make sure 'files' matches backend expectation
    });

    try {
      await api.post(`${Server_API}/creatvehicle`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleShowToast("success", "Vehicle added successfully!");
      setValue({
        name: "",
        model: "",
        vehicleType: "",
        vehicleNumber: "",
        vehicleMilage: "",
        location: "",
      }); // Reset the form values
      setPhotos([]); // Reset the photos state
    } catch (error) {
      console.error("Error:", error);
      const errorMsg=error.response?.data?.message || "An error occurred";
      handleShowToast("danger", errorMsg);
    }
  };

  const vehicleTypenameArray = ["Bike", "Scooty"];
  const vehicleAvailableLocationArray = [
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Delhi",
    "Mumbai",
  ];

  return (
    <>
      <div className={CustomStyle.Main_Container}>
        <div className={CustomStyle.main_Content}>
          <div className={CustomStyle.form_Content_Box}>
            <div className={CustomStyle.form_header}>
              <h3>
                <Car className={FormStyles.icon_white} />
                Add New Vehicle
              </h3>
              <p>Fill in the details to add a vehicle to your fleet</p>
            </div>

            <div className={`${FormStyles.form} ${CustomStyle.form_body} `}>
              <div className={FormStyles.form_group}>
                <label htmlFor="name">
                  <Car className={FormStyles.icon_amber} />
                  Vehicle name<span>* </span>{" "}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={values.name}
                  placeholder="Vehicle name"
                  onChange={(e) => handleValueChange(e, "name")}
                  // className={PageStyle.content_Boxes_inputTag}
                />
              </div>
              <div className={FormStyles.form_group}>
                <label htmlFor="model">
                  <Calendar className={FormStyles.icon_amber} /> Model
                  <span>* </span>{" "}
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  value={values.model}
                  placeholder="Model Year (YYYY)"
                  pattern="\d{4}" // Ensures the input is a 4-digit year
                  maxLength={4}
                  onChange={(e) => handleValueChange(e, "model")}
                />
              </div>

              <div className={FormStyles.form_group}>
                <label htmlFor="quantity">
                  <Hash className={FormStyles.icon_amber} /> Vehicle Number
                  <span>* </span>{" "}
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  id="vehicleNumber"
                  value={values.vehicleNumber}
                  placeholder="vehicleNumber"
                  onChange={(e) => handleValueChange(e, "vehicleNumber")}
                />
              </div>

              <div className={FormStyles.form_group}>
                <label htmlFor="vehicleType">
                  <Car className={FormStyles.icon_amber} />
                  Vehicle Type<span>* </span>{" "}
                </label>

                <select
                  type="text"
                  name="vehicleType"
                  id="vehicleType"
                  value={values.vehicleType}
                  placeholder="Vehicle Type"
                  onChange={(e) => handleValueChange(e, "vehicleType")}
                >
                  <option value="">Select vehicle type</option>
                  {vehicleTypenameArray.map((type, index) => (
                    <option
                      key={index}
                      value={type}
                      onClick={() => handleValueChange(type, "vehicleType")}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={FormStyles.form_group}>
                <label htmlFor="vehicleMilage">
                  <Gauge className={FormStyles.icon_amber} /> Vehicle Milage
                  <span>* </span>{" "}
                </label>
                <input
                  type="text"
                  name="vehicleMilage"
                  id="vehicleMilage"
                  value={values.vehicleMilage}
                  placeholder="vehicle Milage (KM)"
                  pattern="\d*" // Ensures the input is numeric
                  onChange={(e) => handleValueChange(e, "vehicleMilage")}
                />
              </div>
              <div className={FormStyles.form_group}>
                <label htmlFor="location">
                  <MapPin className={FormStyles.icon_amber} />
                  Location
                  <span>* </span>{" "}
                </label>
                <select
                  type="text"
                  name="location"
                  id="location"
                  value={values.location}
                  placeholder="location"
                  onChange={(e) => handleValueChange(e, "location")}
                >
                  <option value="">--</option>
                  {vehicleAvailableLocationArray.map((location, index) => (
                    <option
                      key={index}
                      value={location}
                      onClick={() => handleValueChange(location, "location")}
                    >
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className={FormStyles.form_group}>
                <label>
                  <Upload className={FormStyles.icon_amber} /> Vehicle Images{" "}
                  <span>*</span>
                </label>
                <div className={FormStyles.file_upload}>
                  <Upload className={FormStyles.upload_icon} />
                  <label className={FormStyles.file_label}>
                    <span className={FormStyles.choose_files}>
                      Choose files
                    </span>{" "}
                    or drag and drop
                    <input
                      type="file"
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      multiple
                    />
                  </label>
                  <p className={FormStyles.file_hint}>PNG, JPG up to 10MB</p>
                  {photos.map((photo, index) => (
                    <p key={index} style={{ padding: "0", margin: "0px" }}>
                      {photo.name}{" "}
                    </p>
                  ))}
                </div>
              </div>

              <div className={FormStyles.form_group}>
                <div className={CustomStyle.price_header}>
                  <label>
                    <DollarSign className={FormStyles.icon_amber} /> Booking
                    Price <span>*</span>
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
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={range.price}
                      onChange={(e) =>
                        handleBookingPriceChange(index, "price", e.target.value)
                      }
                    />
                    {/* {priceRanges.length > 1 && ( */}
                    <button
                      type="button"
                      onClick={() => handleRemoveBookingPrice(index)}
                      className={CustomStyle.remove_btn}
                    >
                      −
                    </button>
                    {/* )} */}
                  </div>
                ))}
              </div>

              <div className={ButtonStyles.Button_Container}>
                <button
                  onClick={handleVehicleDetails}
                  className={ButtonStyles.Button_Container_content}
                >
                  Add Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddVehicleDetails;
