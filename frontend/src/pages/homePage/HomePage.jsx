import React, { useState, useEffect, useRef } from "react";
import HomePageStyle from "../../Css/homePageBanner.module.css";

import FormStyles from "../../Css/formContainer.module.css";
import ButtonStyle from "../../Css/button.module.css";

import CarouselComponent from "./CarouselComponent";
import OurKeyStoneComponent from "./OurKeyStoneComponent";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import cleaningBike from "../../assest/cleaningBike.png";
import { Server_API } from "./../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";
import { MapPin } from "lucide-react";
import styles from "./customDatePicker.module.css";
import api from "../../axiosInterceptors/AxiosSetup";

const HomePage = ({ userData }) => {
  const { handleShowToast } = useToast();

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
          userData: userData,
        },
      },
    });
  };

  const topPageRef = useRef(null);

  const handleScroll = () => {
    if (topPageRef.current) {
      topPageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [ListOfVehicle, setListOfVehicle] = useState([]);

  const handleGetAllVehicleList = async () => {
    const response = await api.get(`${Server_API}/getallvehicle`, {
      withCredentials: true,
    });
    handleShowToast("succedd", "All Vehicle List Fetched Successfully");

    setListOfVehicle(response.data.data);
  };

  useEffect(() => {
    handleGetAllVehicleList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  {["Bike", "Scooty"].map((type) => (
                    <button
                      key={type}
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

        <section className={HomePageStyle.heroSection}>
          <div className={HomePageStyle.heroText}>
            <h1>Favourite Bikes</h1>
            <p>Bikes that are trending this month</p>
          </div>
          <div className={HomePageStyle.bikeGrid}>
            {ListOfVehicle &&
              ListOfVehicle.length > 0 &&
              ListOfVehicle.slice(0, 6).map((vehicle) => (
                <div key={vehicle.id} className={HomePageStyle.bikeCard}>
                  <div className={HomePageStyle.imageWrapper}>
                    {console.log("Image URL:", `${Server_API}${vehicle.filePath[0]}`)}
                    {vehicle.filePath && vehicle.filePath.length > 0 && (
                      <img
                        src={`${Server_API}${vehicle.filePath[0]}`} // Prepend base URL to filePath
                        alt="VehicleImage"
                        className={HomePageStyle.bikeImage}
                      />
                    )}
                    <div className={HomePageStyle.trendingBadge}>Trending</div>
                  </div>

                  <div className={HomePageStyle.bikeInfo}>
                    <div className={HomePageStyle.bikeTop}>
                      <p className={HomePageStyle.bikeName}>{vehicle.name}</p>
                      <p>{vehicle.model}</p>
                    </div>

                    <div className={HomePageStyle.location}>
                      <MapPin className={HomePageStyle.mapIcon} />
                      <span>{vehicle.location}</span>
                    </div>

                    <div
                      className={ButtonStyle.Button_Container}
                      style={{ margin: "0.8rem" }}
                    >
                      <button
                        className={ButtonStyle.Button_Container_content}
                        onClick={handleScroll}
                      >
                        Check Availability
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className={HomePageStyle.bike_maintain_section}>
          <div className={HomePageStyle.bike_maintain_section_Content}>
            <div
              className={
                HomePageStyle.bike_maintain_section_Content_ImageContainer
              }
            >
              <img src={cleaningBike} alt="..." />
            </div>

            <div
              className={
                HomePageStyle.bike_maintain_section_Content_TextContainer
              }
            >
              <div
                className={
                  HomePageStyle.bike_maintain_section_Content_TextContainer_Heading
                }
              >
                <h5>The GoGear advantage</h5>
                <h2>Top bikes, everytime!</h2>
                <p>
                  Our bikes maintained so well you will feel they are brand new!
                </p>
              </div>
              <div
                className={
                  HomePageStyle.bike_maintain_section_Content_TextContainer_IconsContent
                }
              >
                <ul
                  className={
                    HomePageStyle.bike_maintain_section_Content_TextContainer_IconsContent_list
                  }
                >
                  <li className="list-inline-item text-center">
                    <svg
                      width="43"
                      height="54"
                      viewBox="0 0 43 54"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.8318 13.3429V11.2925H20.287C20.9609 11.3441 21.4743 11.9244 21.4743 12.6079C21.4743 13.2849 20.9609 13.8523 20.287 13.9039V13.9168C20.9609 13.9683 21.4743 14.5357 21.4743 15.2192C21.4743 15.9027 20.9609 16.4701 20.287 16.5217V16.5346C20.9609 16.5926 21.4743 17.1535 21.4743 17.837C21.4743 18.5205 20.9609 19.0879 20.287 19.1395V19.1524C20.9609 19.2039 21.4743 19.7778 21.4743 20.4548C21.4743 21.1318 20.9609 21.7056 20.287 21.7572V21.8411C21.1855 22.1441 22.007 22.589 22.7322 23.1629L21.301 23.956C20.8389 24.2009 20.5502 24.691 20.5502 25.2261C20.5502 25.7549 20.8389 26.2449 21.3075 26.4963L24.0672 28.018L25.5818 30.8035C25.8128 31.229 26.2364 31.5063 26.7113 31.5514C26.7434 31.9769 26.7627 32.4154 26.7627 32.8603C26.7627 36.7805 26.3712 40.2494 23.7848 42.3127H11.9951C9.40864 40.2494 7.70149 36.7805 7.70149 32.8603C7.70149 28.5468 9.75523 22.2021 12.7652 18.7203C14.0616 17.218 14.8318 15.3353 14.8318 13.3429Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M28.8164 7.3465L26.6921 7.57216V4.12262L28.8164 4.35473C29.0603 4.38051 29.2464 4.58684 29.2464 4.83186V6.86937C29.2464 7.11435 29.0603 7.32068 28.8164 7.3465Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M26.0567 13.1302C25.7743 13.2269 25.4984 13.2785 25.2224 13.2785C23.5108 13.2785 21.641 10.9011 21.3846 8.5005C20.4032 8.59657 19.6265 9.35752 19.5426 10.3641C19.5169 10.6156 19.3115 10.809 19.0612 10.809H16.3272C16.0769 10.809 15.8651 10.6156 15.8458 10.3641C15.756 9.28735 14.8703 8.48138 13.7985 8.48138H13.529C13.5226 8.48138 13.5161 8.48138 13.5161 8.48138C13.2466 8.48138 13.0348 8.26214 13.0348 7.9978C13.0348 7.95266 13.0348 7.91397 13.0476 7.87529C13.1054 5.23168 15.2682 3.09747 17.9188 3.09747H25.2481C25.5112 3.09747 25.7294 3.31026 25.7294 3.58106V7.9978C25.7294 8.26214 25.5112 8.48138 25.2481 8.48138H24.3107C24.4339 10.1954 25.2092 11.9077 26.0567 12.2211C26.2429 12.292 26.3712 12.4725 26.3712 12.6724C26.3712 12.8787 26.2429 13.0593 26.0567 13.1302Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M38.3087 6.33301H30.6448C30.3791 6.33301 30.1635 6.1164 30.1635 5.84943C30.1635 5.58245 30.3791 5.36584 30.6448 5.36584H38.3087C38.5745 5.36584 38.7901 5.58245 38.7901 5.84943C38.7901 6.1164 38.5745 6.33301 38.3087 6.33301Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M36.8728 1.81896L30.8253 4.28063C30.5812 4.37977 30.2991 4.26312 30.1986 4.01396C30.0989 3.76651 30.2174 3.48442 30.4643 3.38399L36.5118 0.922313C36.7563 0.823141 37.0389 0.941203 37.1386 1.18898C37.2382 1.43643 37.1198 1.71852 36.8728 1.81896Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M30.8253 7.41856L36.8728 9.88024C37.1198 9.98067 37.2382 10.2628 37.1386 10.5102C37.0381 10.7592 36.7562 10.8761 36.5118 10.7769L30.4643 8.31521C30.2174 8.21478 30.0989 7.93269 30.1986 7.68523C30.2989 7.43745 30.5803 7.31813 30.8253 7.41856Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M26.429 30.3393L24.7796 27.3024L21.7631 25.6453C21.6091 25.5615 21.5129 25.4003 21.5129 25.2262C21.5129 25.0456 21.6091 24.8845 21.7631 24.8007L24.7796 23.1371L26.429 20.1002C26.5124 19.9455 26.6793 19.8488 26.8525 19.8488C27.0258 19.8488 27.1927 19.9455 27.2761 20.1002L28.9255 23.1371L31.942 24.8007C32.096 24.8845 32.1922 25.0456 32.1922 25.2262C32.1922 25.4003 32.096 25.5615 31.942 25.6453L28.9255 27.3024L27.2761 30.3393C27.1927 30.494 27.0258 30.5907 26.8525 30.5907C26.6793 30.5907 26.5124 30.494 26.429 30.3393Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M2.36823 14.1425L4.53106 12.9561L5.71197 10.7832C5.79537 10.6284 5.95582 10.5317 6.13554 10.5317C6.30883 10.5317 6.46928 10.6284 6.55272 10.7832L7.73359 12.9561L9.89642 14.1425C10.0504 14.2263 10.1467 14.3875 10.1467 14.568C10.1467 14.7421 10.0504 14.9033 9.89642 14.9871L7.73359 16.1735L6.55272 18.3464C6.46928 18.5012 6.30883 18.5979 6.13554 18.5979C5.95582 18.5979 5.79537 18.5012 5.71197 18.3464L4.53106 16.1735L2.36823 14.9871C2.2142 14.9033 2.11792 14.7421 2.11792 14.568C2.11792 14.3875 2.2142 14.2263 2.36823 14.1425Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M34.5476 16.9666L36.2355 16.0317L37.1661 14.3359C37.333 14.02 37.84 14.02 38.0069 14.3359L38.9375 16.0317L40.6318 16.9666C40.7858 17.0504 40.8821 17.2116 40.8821 17.3921C40.8821 17.5662 40.7858 17.7274 40.6318 17.8112L38.9375 18.7462L38.0069 20.4484C37.8237 20.788 37.3441 20.7785 37.1661 20.4484L36.2355 18.7462L34.5476 17.8112C34.3936 17.7274 34.2973 17.5662 34.2973 17.3921C34.2973 17.2116 34.3936 17.0504 34.5476 16.9666Z"
                        fill="#FF7A00"
                      ></path>
                    </svg>
                    <p>
                      Sanitised <br />
                      Bikes
                    </p>
                  </li>
                  <li className="list-inline-item text-center">
                    <svg
                      width="50"
                      height="63"
                      viewBox="0 0 50 63"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M41.25 24.1416C40.9 24.1416 40.55 24.192 40.2 24.2424L36.05 12.1968C35.85 11.6424 35.3 11.2392 34.7 11.2392H31.8C31 11.2392 30.4 11.8944 30.4 12.6504C30.4 13.4568 31.05 14.0616 31.8 14.0616H33.7L34.7 16.9344C34.6 16.884 34.5 16.8336 34.35 16.7328C30.95 15.12 26.05 15.5232 24.3 18.1944C23 20.16 19.65 19.656 16.55 19.1016C15.8 18.9504 15.6 17.64 14.8 17.388C11.6 16.4304 7.15003 16.3296 4.95003 16.4304C4.40003 16.4808 4.05003 17.136 4.35003 17.64L6.05003 20.4624C6.20003 20.7648 6.50003 20.9664 6.80003 21.0672L8.30003 21.672L11.3 22.7304C13.65 23.436 15.6 25.0488 16.8 27.1656L15.15 27.7704C13.85 25.5528 11.45 24.0912 8.75003 24.0912C4.65003 24.0912 1.25003 27.468 1.25003 31.6512C1.25003 35.8344 4.60003 39.2112 8.75003 39.2112C12.9 39.2112 16.25 35.8344 16.25 31.6512C16.25 31.248 16.2 30.8448 16.15 30.492L17.8 29.8872C17.9 30.4416 17.95 31.0464 17.95 31.6512C17.95 32.3064 17.9 32.9616 17.75 33.5664H32.3C32.15 32.9616 32.1 32.3064 32.1 31.6512C32.1 28.1232 34.1 25.0488 37 23.4864L37.55 25.1496C35.3 26.46 33.8 28.8792 33.8 31.6512C33.8 35.784 37.15 39.2112 41.3 39.2112C45.45 39.2112 48.8 35.8344 48.8 31.6512C48.8 27.468 45.4 24.1416 41.25 24.1416ZM13.4 31.6512C13.4 34.2216 11.3 36.3384 8.75003 36.3384C6.20003 36.3384 4.10003 34.272 4.10003 31.6512C4.10003 29.0304 6.20003 26.964 8.75003 26.964C10.25 26.964 11.55 27.6696 12.4 28.7784L8.25003 30.2904C7.50003 30.5424 7.15003 31.3992 7.40003 32.1048C7.60003 32.7096 8.15003 33.0624 8.75003 33.0624C8.90003 33.0624 9.05003 33.012 9.25003 32.9616L13.4 31.4496C13.35 31.5504 13.4 31.6008 13.4 31.6512ZM41.25 36.3384C38.7 36.3384 36.6 34.2216 36.6 31.6512C36.6 30.1392 37.35 28.7784 38.45 27.9216L39.9 32.1048C40.1 32.7096 40.65 33.0624 41.25 33.0624C41.4 33.0624 41.55 33.012 41.7 32.9616C42.45 32.7096 42.85 31.9032 42.55 31.1472L41.1 26.964C41.15 26.964 41.15 26.964 41.2 26.964C43.75 26.964 45.85 29.0808 45.85 31.6512C45.85 34.2216 43.85 36.3384 41.25 36.3384Z"
                        fill="#FF7A00"
                      ></path>
                      <path
                        d="M42.4 20.3112H43.4C43.8 20.3112 44.1 20.0088 44.1 19.6056V14.5656C44.1 14.1624 43.8 13.86 43.4 13.86H42.25C40.4 13.86 38.85 15.4728 39.05 17.4384C39.25 19.1016 40.75 20.3112 42.4 20.3112Z"
                        fill="#FF7A00"
                      ></path>
                    </svg>
                    <p>
                      Latest <br />
                      Models
                    </p>
                  </li>
                  <li className="list-inline-item text-center">
                    <svg
                      width="42"
                      height="52"
                      viewBox="0 0 42 52"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M25.9586 0C22.8218 1.47355 18.6828 3.15575 14.0464 3.5737C13.5509 3.6179 13.1782 4.01115 13.1906 4.4759C13.314 9.07855 13.4249 14.926 14.3089 17.5299C15.9331 22.5823 20.4632 26.663 25.8241 28.2256C26.0197 28.2822 26.2047 28.2808 26.3996 28.2217C31.7802 26.5844 36.0196 22.5842 37.7121 17.5324C38.8139 14.2473 38.7516 9.087 38.827 4.47135C38.8343 4.0092 38.4628 3.62115 37.9693 3.57695C33.3145 3.1629 29.1585 1.47745 26.0105 0H25.9586ZM23.1958 12.1589L25.0307 14.079L29.276 9.96385C29.6244 9.62585 30.1868 9.63235 30.5274 9.97685L31.7651 11.2294C32.1064 11.5745 32.0998 12.1316 31.752 12.4696L26.2152 17.836L25.5721 18.4594C25.3956 18.631 25.1803 18.7148 24.9329 18.7096C24.6855 18.7038 24.4748 18.6101 24.3062 18.4307L23.69 17.7775L20.6187 14.545C20.2853 14.194 20.3057 13.637 20.6614 13.3075L21.9437 12.1173C22.1215 11.9522 22.3348 11.8729 22.5783 11.8813C22.8224 11.8891 23.0285 11.984 23.1958 12.1589ZM23.7864 31.0804L34.5601 28.9737C36.2847 28.5942 37.3748 28.8333 37.5782 29.7921L25.2039 32.2309C25.1685 32.238 25.1357 32.2322 25.1062 32.2121L23.7398 31.3157C23.6946 31.2864 23.6729 31.2351 23.6834 31.1824C23.6939 31.1298 23.7333 31.0908 23.7864 31.0804ZM6.26325 25.8421C8.82197 24.1982 11.6412 24.3041 13.9735 25.3799C15.4973 26.0826 16.651 27.4918 18.0712 28.34L21.5801 30.2906C23.4176 31.2969 22.4864 33.8624 20.79 33.4854L17.1399 33.0154C16.6924 32.9583 16.3177 32.8178 15.9515 32.5565L11.9077 29.664C11.5224 29.3579 11.0572 29.965 11.506 30.2614L15.6017 33.3184C15.9659 33.59 16.5913 33.8221 17.0435 33.8839L20.6843 34.3811C21.9378 34.554 23.0042 33.9944 23.3914 32.6189C23.4025 32.5787 23.4294 32.5488 23.4688 32.5331C23.5082 32.5176 23.5482 32.5201 23.5843 32.5416L24.6527 33.1688C24.6822 33.1857 24.7131 33.1909 24.7465 33.1844L39.0488 30.2458C42.1555 29.679 43.3007 33.4282 40.049 34.2076L24.7373 39.0325C22.3709 39.778 20.0931 40.0088 17.7634 39.1586L10.2185 36.4058C9.54844 36.1614 8.83969 36.1679 8.24972 36.5671L1.11628 41.39C0.736313 41.6474 0 41.7957 0 41.0514V31.5406C0 30.3719 0.294656 29.8227 0.821625 29.3891C2.40384 28.0878 5.61291 26.26 6.26325 25.8421ZM25.9711 3.57695C23.6283 4.6774 20.5367 5.9345 17.0743 6.2465C16.7042 6.27965 16.4259 6.57345 16.4351 6.92055C16.527 10.3584 16.6103 14.7257 17.2705 16.6699C18.4833 20.4438 21.8669 23.4916 25.8713 24.659C26.017 24.7013 26.1555 24.7 26.3005 24.6558C30.3201 23.4331 33.4858 20.4451 34.7498 16.6725C35.5727 14.2188 35.5268 10.3643 35.5825 6.9173C35.5884 6.5715 35.3108 6.2816 34.9427 6.2491C31.4652 5.93905 28.3612 4.68065 26.0098 3.57695H25.9711Z"
                        fill="#FF7A00"
                      ></path>
                    </svg>
                    <p>
                      Always <br />
                      Insured
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
