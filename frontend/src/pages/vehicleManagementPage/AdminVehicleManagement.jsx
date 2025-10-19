import React, { useEffect, useState } from "react";
import VehicleManagementStyle from "./VehicleManagementPageStyle.module.css";

import { Server_API } from "./../../APIPoints/AllApiPonts";
import { useToast } from "../../ContextApi/ToastContext";

import Box from "@mui/material/Box";

import Modal from "@mui/material/Modal";

import {
  Edit2,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Gauge,
  IndianRupee,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SingleVehicleEditComponent from "./SingleVehicleEditComponent";
import VechicleGroupUpadtesModel from "./VechicleGroupUpadtesModel";
import api from "../../axiosInterceptors/AxiosSetup";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 0,
  height: "90vh",
  border: "none",
  overflowY: "scroll",

  width: {
    xs: "90%", // small screens (mobile)
    sm: "70%", // tablets
    md: "50%", // small laptops
    lg: "70%", // desktops
  },
};
const styleTwo = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 0,
  height: "90vh",
  border: "none",
  overflowY: "scroll",
  width: "90vw",
  p: 4,
};

const AdminVehicleManagement = () => {
  const { handleShowToast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const handleGroupOpen = () => setGroupOpen(true);
  const handleGroupClose = () => setGroupOpen(false);

  const [ListOfVehicle, setListOfVehicle] = useState([]);

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [OneVehicleData, setOneVehicleData] = useState({
    location: "",
    vehicleNumber: "",
    vehicleStatus: "",
    notAvailableReason: "",
    vehicleMilage: "",
    uniqueVehicleId: "",
  });

  const handleGetAllVehicleList = async () => {
    const response = await api.get(`${Server_API}/getallvehicle`, {
      withCredentials: true,
    });

    setListOfVehicle(response.data.data);
  };

  useEffect(() => {
    handleGetAllVehicleList();
  }, []);

  if (!ListOfVehicle || ListOfVehicle.length === 0) {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <p>No data</p>
      </div>
    );
  }

  const handleEditEachVehicle = (vehicleData) => {
    handleOpen();
    setOneVehicleData({
      location: vehicleData.location,
      vehicleNumber: vehicleData.vehicleNumber,
      vehicleStatus: vehicleData.vehicleStatus,
      notAvailableReason: vehicleData.notAvailableReason,
      vehicleMilage: vehicleData.vehicleMilage,
      uniqueVehicleId: vehicleData.uniqueVehicleId,
    });
  };

  /*Handle Delete Single Vehicle of The Group */
  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await api.delete(`${Server_API}/deletevehicle/${vehicleId}`, {
        withCredentials: true,
      });

      handleShowToast("success", "Vehicle deleted successfully");
      handleGetAllVehicleList();
    } catch (error) {

      const ErrMessage =
        error.response?.data?.error || "Failed to delete vehicle";
      handleShowToast("danger", ErrMessage);
    }
  };
  /*Handle Update Single Vehicle of The Group */
  const handleUpdateVehicleData = async (vehicleId) => {
    try {
      await api.patch(
        `${Server_API}/updatevehicle/${vehicleId}`,
        OneVehicleData,
        {
          withCredentials: true,
        }
      );
      handleShowToast("success", "Vehicle data updated successfully");
      handleClose();
      handleGetAllVehicleList();
    } catch (error) {
      const ErrMessage =
        error.response?.data?.error || "Failed to update vehicle";
      handleShowToast("danger", ErrMessage);
      handleGetAllVehicleList();
    }
  };

  const selectedGroup = ListOfVehicle[selectedGroupIndex];

  const filteredVehicles = selectedGroup.specificVehicleDetails.filter((v) => {
    const matchesSearch =
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.uniqueVehicleId.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Available" &&
        v.vehicleStatus &&
        v.bookedPeriods.length === 0) ||
      (statusFilter === "Booked" && v.bookedPeriods.length > 0) ||
      (statusFilter === "Unavailable" && !v.vehicleStatus);
    const matchesLocation =
      locationFilter === "All" || v.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getVehicleStatus = (vehicle) => {
    if (!vehicle.vehicleStatus)
      return { text: "Unavailable", color: VehicleManagementStyle.status_unavailable };
    if (vehicle.bookedPeriods.length > 0)
      return { text: "Booked", color: VehicleManagementStyle.status_booked};
    return { text: "Available", color: VehicleManagementStyle.status_available};
  };

  const availableCount = selectedGroup.specificVehicleDetails.filter(
    (v) => v.vehicleStatus && v.bookedPeriods.length === 0
  ).length;
  const bookedCount = selectedGroup.specificVehicleDetails.filter(
    (v) => v.bookedPeriods.length > 0
  ).length;
  const unavailableCount = selectedGroup.specificVehicleDetails.filter(
    (v) => !v.vehicleStatus
  ).length;
  const uniqueLocations = [
    ...new Set(selectedGroup.specificVehicleDetails.map((v) => v.location)),
  ];

  return (
    <>
      <div
        className={`${VehicleManagementStyle.vehicle_management} ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {/* Sidebar */}
        <aside className={VehicleManagementStyle.sidebar}>
          <div className={VehicleManagementStyle.sidebar_header}>
            <p className={VehicleManagementStyle.sidebar_header_title}>
              Vehicle Groups
            </p>
            <button
              onClick={() => setSidebarOpen(false)}
              className={VehicleManagementStyle.close_sidebar}
            >
              <X size={20} />
            </button>
          </div>
          <div className={VehicleManagementStyle.sidebar_list}>
            {ListOfVehicle.map((group, index) => {
              const isSelected = selectedGroupIndex === index;
              return (
                <button
                  key={group.uniqueGroupId}
                  onClick={() => setSelectedGroupIndex(index)}
                  className={`${VehicleManagementStyle.group_item} ${
                    isSelected ? `${VehicleManagementStyle.selected}` : ""
                  }`}
                >
                  <div className={VehicleManagementStyle.group_info_container}>
                    <div className={VehicleManagementStyle.group_info}>
                      <h3>{group.name}</h3>
                      <div className={VehicleManagementStyle.group_meta}>
                        <span>{group.vehicleType}</span>
                        <span>{group.model}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={VehicleManagementStyle.group_item_right_arrow}
                  >
                    {" "}
                    {isSelected && <ChevronRight size={18} />}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className={VehicleManagementStyle.main_content}>
          {/* Header */}
          <header className={VehicleManagementStyle.header}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className={VehicleManagementStyle.open_sidebar}
              >
                <Menu size={20} />
              </button>
            )}
            <div className={VehicleManagementStyle.header_container}>
              <div className={VehicleManagementStyle.header_title}>
                <h1>{selectedGroup.name}</h1>
              </div>
              <div className={VehicleManagementStyle.btnContainer}>
                <button
                  className={VehicleManagementStyle.add_vehicle}
                  onClick={() => handleGroupOpen()}
                >
                  <Plus size={16} /> Edit Group
                </button>
                <button
                  className={VehicleManagementStyle.add_vehicle}
                  onClick={() => navigate("/addvehicle")}
                >
                  <Plus size={16} /> Add Vehicle
                </button>
              </div>
            </div>
          </header>

          {/* Stats of vehicle data */}
          <section className={VehicleManagementStyle.group_stats_cards}>
            <p
              className={`${VehicleManagementStyle.card} ${VehicleManagementStyle.total}`}
            >
              Total Vehicles: {selectedGroup.specificVehicleDetails.length}
            </p>
            <p
              className={`${VehicleManagementStyle.card} ${VehicleManagementStyle.available}`}
            >
              Available: {availableCount}
            </p>
            <p
              className={`${VehicleManagementStyle.card} ${VehicleManagementStyle.booked}`}
            >
              Booked: {bookedCount}
            </p>
            <p
              className={`${VehicleManagementStyle.card} ${VehicleManagementStyle.unavailable}`}
            >
              Unavailable: {unavailableCount}
            </p>
          </section>

          {/* Pricing Table */}
          <section className={VehicleManagementStyle.pricing_table}>
            <h4>
              <IndianRupee size={14} /> Booking Price Tiers
            </h4>
            <div className={VehicleManagementStyle.pricing_grid}>
              {selectedGroup.bookingPrice.map((price, idx) => (
                <div key={idx} className={VehicleManagementStyle.price_card}>
                  <p className={VehicleManagementStyle.price}>
                    {price.price}&#8377; / {price.range} km
                  </p>
                  <p className={VehicleManagementStyle.per_km}>
                    {(price.price / price.range).toFixed(2)}&#8377; per km
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Filters */}
          <section className={VehicleManagementStyle.filters}>
            <input
              type="text"
              placeholder="Search by vehicle number or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {["All", "Available", "Booked", "Unavailable"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option>All</option>
              {uniqueLocations.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
          </section>

          {/* Vehicle Grid */}
          <section className={VehicleManagementStyle.vehicle_grid}>
            {filteredVehicles.length === 0 && (
              <p className={VehicleManagementStyle.no_vehicles}>
                No vehicles found matching your criteria
              </p>
            )}
            {filteredVehicles.map((vehicle) => {
              const status = getVehicleStatus(vehicle);
              return (
                <div
                  key={vehicle.uniqueVehicleId}
                  className={VehicleManagementStyle.vehicle_card}
                >
                  <div>
                    <div
                      className={`${VehicleManagementStyle.vehicle_header} ${status.color}`}
                    >
                      <p>{vehicle.vehicleNumber}</p>

                      <span>{status.text}</span>
                    </div>
                    <div className={VehicleManagementStyle.vehicle_details}>
                      <p>Vehicle Model: {selectedGroup.model}</p>
                      <p>
                        <MapPin size={14} /> {vehicle.location}
                      </p>
                      <p>
                        <Gauge size={14} /> {vehicle.vehicleMilage} km
                      </p>
                      {vehicle.bookedPeriods.length > 0 && (
                        <div className={VehicleManagementStyle.booked_periods}>
                          <Calendar size={14} />
                          {vehicle.bookedPeriods.map((p, i) => (
                            <p key={i}>
                              {new Date(p.startDate).toLocaleDateString()} -{" "}
                              {new Date(p.endDate).toLocaleDateString()}
                            </p>
                          ))}
                        </div>
                      )}
                      {!vehicle.vehicleStatus && vehicle.notAvailableReason && (
                        <div className={VehicleManagementStyle.not_available}>
                          Reason: {vehicle.notAvailableReason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={VehicleManagementStyle.vehicle_actions}>
                    <button onClick={() => handleEditEachVehicle(vehicle)}>
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteVehicle(vehicle.uniqueVehicleId)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        </main>
      </div>

      {/*  ===== Model For Single Vehicle Update/Edit Component  ==== */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <SingleVehicleEditComponent
            data={OneVehicleData}
            onChange={setOneVehicleData}
            submit={handleUpdateVehicleData}
          />
        </Box>
      </Modal>

      {/*  ===== Model For Vehicle Group Update/Edit Component  ==== */}

      <Modal
        open={groupOpen}
        onClose={handleGroupClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleTwo}>
          <VechicleGroupUpadtesModel
            selectedGroup={selectedGroup}
            handleGroupClose={handleGroupClose}
            handleGetAllVehicleList={handleGetAllVehicleList}
          />
        </Box>
      </Modal>
    </>
  );
};

export default AdminVehicleManagement;
