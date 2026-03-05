import React, { useEffect } from "react";
import HomePageStyle from "../../Css/homePageBanner.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getVehicleData } from "../../appRedux/redux/vehicleSlice/getvehicleSlice";
import ButtonStyle from "../../Css/button.module.css";
import { Server_API } from "../../APIPoints/AllApiPonts";
import { MapPin } from "lucide-react";

const ShowVehicleComponet = ({ data }) => {
  const dispatch = useDispatch();
  const { vehicleList, loading, error } = useSelector(
    (state) => state.vehicleList
  );

  useEffect(() => {
    dispatch(getVehicleData());
  }, [dispatch]);
  const handleScroll = () => {
    if (data.current) {
      data.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div>
      <section className={HomePageStyle.heroSection}>
        <div className={HomePageStyle.heroText}>
          <h1>Favourite Bikes</h1>
          <p>Bikes that are trending this month</p>
        </div>
        <div className={HomePageStyle.bikeGrid}>
          {vehicleList &&
            vehicleList.length > 0 &&
            vehicleList.slice(0, 20).map((vehicle) => (
              <div key={vehicle._id} className={HomePageStyle.bikeCard}>
                <div className={HomePageStyle.imageWrapper}>
                  {vehicle.filePath && vehicle.filePath.length > 0 && (
                    <img
                      src={vehicle.filePath[0]} // Prepend base URL to filePath
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
    </div>
  );
};

export default ShowVehicleComponet;
