import React, { useEffect } from "react";
import VehicleListComponent from "./VehicleListComponent";
import { useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { getVehicleData } from "../../appRedux/redux/vehicleSlice/getvehicleSlice";

const AllVehicleListpage = () => {
  const dispatch = useDispatch();
  const { vehicleList } = useSelector(
    (state) => state.vehicleList
  );

  useEffect(() => {
    dispatch(getVehicleData());
  }, [dispatch]);

  const location = useLocation();
  const { pickupDate, dropDate, SelectedVehicleOption, userData } =
    location.state?.allData || {};
  return (
    <>
    
    
      <div style={{ height: "max-content" }}>
        <VehicleListComponent
          ListOfVehicle={vehicleList}
          EndDate={dropDate}
          startDate={pickupDate}
          SelectedVehicleOption={SelectedVehicleOption}
          userData={userData}
        />
      </div>
    </>
  );
};

export default AllVehicleListpage;
