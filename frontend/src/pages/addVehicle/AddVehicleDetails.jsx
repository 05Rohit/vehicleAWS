// ...existing code...
import { useState, useEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import {
  addVehicleData,
  resetAddVehicleDataState,
} from "../../appRedux/redux/vehicleSlice/addVehicleSlice";

const AddVehicleDetails = () => {
  const { handleShowToast } = useToast();
  const dispatch = useDispatch();
  const { loading, addVehicleResponse, error } = useSelector(
    (state) => state.addVehicle
  );

  const [bookingPrice, setBookingPrice] = useState([{ range: "", price: "" }]);

  const [values, setValue] = useState({
    name: "",
    model: "",
    vehicleType: "",
    vehicleNumber: "",
    vehicleMilage: "",
    location: "",
  });
  const [photos, setPhotos] = useState([]);

  const handleBookingPriceChange = (index, field, value) => {
    const updated = [...bookingPrice];
    updated[index][field] = value.replace(/\D/g, ""); // only digits
    setBookingPrice(updated);
  };

  const handleAddBookingPrice = () => {
    if (bookingPrice.length < 3) {
      setBookingPrice([...bookingPrice, { range: "", price: "" }]);
    }
  };

  const handleRemoveBookingPrice = (index) => {
    if (bookingPrice.length > 1) {
      setBookingPrice(bookingPrice.filter((_, i) => i !== index));
    }
  };

  const handleValueChange = (e, field) => {
    const { value } = e.target;
    let updated = value;

    if (field === "vehicleMilage" || field === "model") {
      updated = value.replace(/\D/g, ""); // Only numbers
    }

    setValue((prev) => ({
      ...prev,
      [field]: updated,
    }));
  };

  const handlePhotoUpload = (event) => {
    const selectedPhotos = Array.from(event.target.files || []);
    setPhotos(selectedPhotos);
  };
  console.log("Photos:", photos);

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
      handleShowToast("danger", "Please fill all the fields correctly");
      return;
    }

    if (bookingPrice.length !== 3) {
      handleShowToast("danger", "Please provide 3 price ranges");
      return;
    }

    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    formData.append("bookingPrice", JSON.stringify(bookingPrice));
    photos.forEach((photo) => formData.append("files", photo));

    try {
      await dispatch(addVehicleData(formData)).unwrap();

      // Reset form
      setValue({
        name: "",
        model: "",
        vehicleType: "",
        vehicleNumber: "",
        vehicleMilage: "",
        location: "",
      });
      setBookingPrice([{ range: "", price: "" }]);
      setPhotos([]);
    } catch (err) {
      // Error handled in slice

    }
  };

  // Auto show toast from slice side
  useEffect(() => {
    if (addVehicleResponse) {
      handleShowToast("success", "Vehicle added successfully");
      dispatch(resetAddVehicleDataState());
    }
    if (error) {
      handleShowToast("danger", error);
      dispatch(resetAddVehicleDataState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addVehicleResponse, error, dispatch]);

  const vehicleTypenameArray = ["Bike", "Scooty"];
  const vehicleAvailableLocationArray = [
    "Bangalore",
    "Chennai",
    "Hyderabad",
    "Delhi",
    "Mumbai",
  ];

  return (
    <div className={CustomStyle.Main_Container}>
      <div className={CustomStyle.main_Content}>
        <div className={CustomStyle.form_Content_Box}>
          <div className={CustomStyle.form_header}>
            <h3>
              <Car className={FormStyles.icon_white} /> Add New Vehicle
            </h3>
            <p>Fill in the details to add a vehicle to your fleet</p>
          </div>

          <div className={`${FormStyles.form} ${CustomStyle.form_body}`}>
            {/** Vehicle Name */}
            <div className={FormStyles.form_group}>
              <label htmlFor="name">
                <Car className={FormStyles.icon_amber} />
                Vehicle name<span>* </span>
              </label>
              <input
                type="text"
                value={values.name}
                onChange={(e) => handleValueChange(e, "name")}
                placeholder="Vehicle name"
              />
            </div>

            {/** Model */}
            <div className={FormStyles.form_group}>
              <label htmlFor="model">
                <Calendar className={FormStyles.icon_amber} /> Model
                <span>* </span>
              </label>
              <input
                type="text"
                maxLength={4}
                value={values.model}
                onChange={(e) => handleValueChange(e, "model")}
                placeholder="Model Year (YYYY)"
              />
            </div>

            {/** Vehicle Number */}
            <div className={FormStyles.form_group}>
              <label htmlFor="vehicleNumber">
                <Hash className={FormStyles.icon_amber} /> Vehicle Number
                <span>* </span>
              </label>
              <input
                type="text"
                value={values.vehicleNumber}
                onChange={(e) => handleValueChange(e, "vehicleNumber")}
                placeholder="Vehicle Number"
              />
            </div>

            {/** Vehicle Type */}
            <div className={FormStyles.form_group}>
              <label>
                <Car className={FormStyles.icon_amber} /> Vehicle Type
                <span>* </span>
              </label>
              <select
                value={values.vehicleType}
                onChange={(e) => handleValueChange(e, "vehicleType")}
              >
                <option value="">Select vehicle type</option>
                {vehicleTypenameArray.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/** Milage */}
            <div className={FormStyles.form_group}>
              <label>
                <Gauge className={FormStyles.icon_amber} /> Vehicle Milage
                <span>* </span>
              </label>
              <input
                type="text"
                value={values.vehicleMilage}
                onChange={(e) => handleValueChange(e, "vehicleMilage")}
                placeholder="Milage (KM)"
              />
            </div>

            {/** Location */}
            <div className={FormStyles.form_group}>
              <label>
                <MapPin className={FormStyles.icon_amber} /> Location
                <span>* </span>
              </label>
              <select
                value={values.location}
                onChange={(e) => handleValueChange(e, "location")}
              >
                <option value="">--</option>
                {vehicleAvailableLocationArray.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/** File Upload */}
            <div className={FormStyles.form_group}>
              <label>
                <Upload className={FormStyles.icon_amber} /> Vehicle Images
                <span>*</span>
              </label>
              <div className={FormStyles.file_upload}>
                <Upload className={FormStyles.upload_icon} />
                <label className={FormStyles.file_label}>
                  <span className={FormStyles.choose_files}>Choose files</span>
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
                  <p key={index}>{photo.name}</p>
                ))}
              </div>
            </div>

            {/** Price Ranges */}
            <div className={FormStyles.form_group}>
              <div className={CustomStyle.price_header}>
                <label>
                  <DollarSign className={FormStyles.icon_amber} /> Booking Price
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
                  />
                  <input
                    type="text"
                    placeholder="Price (₹)"
                    value={range.price}
                    onChange={(e) =>
                      handleBookingPriceChange(index, "price", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBookingPrice(index)}
                    className={CustomStyle.remove_btn}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>

            {/** Submit Button */}
            <div className={ButtonStyles.Button_Container}>
              <button
                onClick={handleVehicleDetails}
                className={ButtonStyles.Button_Container_content}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Vehicle"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleDetails;
