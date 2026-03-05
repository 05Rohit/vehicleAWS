import React, { useState, useEffect, useRef } from "react";
import HomePageStyle from "../../Css/homePageBanner.module.css";

import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";

import CarouselComponent from "./CarouselComponent";
import OurKeyStoneComponent from "./OurKeyStoneComponent";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../../ContextApi/ToastContext";

import styles from "./customDatePicker.module.css";
import { useSelector } from "react-redux";
import ShowVehicleComponet from "./ShowVehicleComponet";
import BikeMaintanance from "./BikeMaintanance";

const HomePage = () => {
  const { handleShowToast } = useToast();
  //Redux User Data
  const { user } = useSelector((state) => state.login);

  const [SelectedVehicleOption, setSelectedVehicleOption] = useState("Bike");
  const [minDate, setMinDate] = useState("");
  const [value, setValue] = useState({
    pickupDate: "",
    pickupTime: "",
    dropDate: "",
    dropupTime: "",
  });

  const navigate = useNavigate();

  // ✅ Set minimum selectable date to today
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    setMinDate(formattedDate);
  }, []);

  // ✅ Handle input changes cleanly
  const handleInputChange = ({ target: { name, value } }) => {
    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset drop date if pickup date changes
    if (name === "pickupDate") {
      setValue((prev) => ({
        ...prev,
        pickupDate: value,
        dropDate: "",
      }));
    }
  };

  const handleSearch = () => {
    if (!value.pickupDate || !value.dropDate) {
      handleShowToast("danger", "Please select both pickup and drop dates");
      return;
    }
    navigate("/filterVehicle", {
      state: {
        allData: {
          pickupDate: value.pickupDate,
          dropDate: value.dropDate,
          SelectedVehicleOption: SelectedVehicleOption,
          userData:user,
        },
      },
    });
  };

  const topPageRef = useRef(null);



  return (
    <>
      <div className={HomePageStyle.banner_Main_Container}>
        <section className={HomePageStyle.banner_Container}>
          <div
            ref={topPageRef}
            className={HomePageStyle.banner_Container_Content}
          >
            <div className={HomePageStyle.banner_Container_Content_leftSide}>
              <div
                className={
                  HomePageStyle.banner_Container_Content_leftSide_content
                }
              >
                <h2>
                  Rent uber-maintained bikes and scooters for a smooth,
                  hassle-free experience.
                </h2>
                <p>
                  Available on Hourly, Daily, Weekly, and Monthly plans — ride
                  the way you want!
                </p>
              </div>
            </div>
            <div className={HomePageStyle.banner_Container_Content_rightSide}>
              <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                  <p>Choose your vehicle and set your journey</p>
                </div>

                {/* Tabs */}
                <div className={styles.vehicleTabs}>
                  {["Bike", "Scooty"].map((type, index) => (
                    <button
                      key={index}
                      className={`${styles.tab} ${
                        SelectedVehicleOption === type ? styles.active : ""
                      }`}
                      onClick={() => setSelectedVehicleOption(type)}
                    >
                      <p className={styles.tabLabel}>{type}</p>
                    </button>
                  ))}
                </div>

                {/* Form */}
                <div className={`${FormStyles.form} ${styles.FormContainer}`}>
                  {/* Pickup Section */}
                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}>📍</span> Pickup
                      Details
                    </div>
                    <div className={styles.formContainer}>
                      <div className={FormStyles.form_group}>
                        <input
                          type="date"
                          id="pickupDate"
                          name="pickupDate"
                          value={value.pickupDate}
                          onChange={handleInputChange}
                          min={minDate}
                          placeholder=" "
                          required
                        />
                        <label
                          className={styles.inputLabel}
                          htmlFor="pickupDate"
                        >
                          Select Date
                        </label>
                      </div>

                      <div className={FormStyles.form_group}>
                        <input
                          type="time"
                          id="pickupTime"
                          name="pickupTime"
                          value={value.pickupTime}
                          onChange={handleInputChange}
                          placeholder=" "
                          required
                        />
                        <label
                          className={styles.inputLabel}
                          htmlFor="pickupTime"
                        >
                          Pick-up Time
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Drop Section */}
                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}>📌</span> Drop-off
                      Details
                    </div>
                    <div className={styles.formContainer}>
                      <div className={FormStyles.form_group}>
                        <input
                          type="date"
                          id="dropDate"
                          name="dropDate"
                          value={value.dropDate}
                          onChange={handleInputChange}
                          min={value.pickupDate || minDate}
                          placeholder=" "
                          required
                        />
                        <label className={styles.inputLabel} htmlFor="dropDate">
                          Drop-off Date
                        </label>
                      </div>

                      <div className={FormStyles.form_group}>
                        <input
                          type="time"
                          id="dropTime"
                          name="dropupTime"
                          value={value.dropupTime}
                          onChange={handleInputChange}
                          placeholder=" "
                          required
                        />
                        <label className={styles.inputLabel} htmlFor="dropTime">
                          Drop-off Time
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <div
                    className={ButtonStyle.Button_Container}
                    style={{ marginTop: "0" }}
                  >
                    <button
                      className={ButtonStyle.Button_Container_content}
                      onClick={handleSearch}
                    >
                      Search Your Ride
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <CarouselComponent />

        <OurKeyStoneComponent />
        <ShowVehicleComponet data={topPageRef} />
        <BikeMaintanance />
      </div>
    </>
  );
};

export default HomePage;
