import React, { useEffect, useState } from "react";
import VehicleListComponent from "./VehicleListComponent";
import { useLocation } from "react-router-dom";
import { Server_API } from "../../APIPoints/AllApiPonts";

import { useToast } from "../../ContextApi/ToastContext";
import api from "../../axiosInterceptors/AxiosSetup";

const AllVehicleListpage = () => {
  const { handleShowToast } = useToast();

  const [ListOfVehicle, setListOfVehicle] = useState([]);

  const handleGetAllVehicleList = async () => {
    try {
      const response = await api.get(`${Server_API}/getallvehicle`, {
        withCredentials: true,
      });
      setListOfVehicle(response.data.data);
    } catch (error) {
      handleShowToast("error", error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    handleGetAllVehicleList();
    // eslint-disable-next-line
  }, []);

  const location = useLocation();
  const { pickupDate, dropDate, SelectedVehicleOption, userData } =
    location.state?.allData || {};
  return (
    <>
      <div style={{ height: "max-content" }}>
        <VehicleListComponent
          ListOfVehicle={ListOfVehicle}
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
