import React, { useState, useEffect } from "react";
import styles from "../DashBoard.module.css";
// import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVehicleListData } from "../../../appRedux/redux/reportSlice/adminReportSlice";
import { Car, X } from "lucide-react";

const VehicleInventoryReport = () => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const dispatch = useDispatch();

  const VehicleInventryList = useSelector(
    (state) => state.adminReportData?.vehicleList || []
  );

  useEffect(() => {
    dispatch(fetchAllVehicleListData());
  }, [dispatch]);

  /* Handle Close the Model with effect */
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200); // must match animation duration
  };

  /* --------- chart VehicleInventryList --------- */


  return (
    <>
      {" "}
      <div
        className={`${styles.kpiCard} ${styles.purple}`}
        onClick={() => setOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <Car />
        <h4>Vehicle Inventry Details</h4>
        <p>{VehicleInventryList.length}</p>
      </div>
      {open && (
        <div
          className={`${styles.modalOverlay} ${closing ? styles.closing : ""}`}
        >
          <div className={`${styles.modal} ${closing ? styles.closing : ""}`}>
            <div className={styles.groupHeader}>
              <h4>Vehicle Inventry Details</h4>
              <button onClick={() => handleClose()}>
                {" "}
                <X />
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sl No.</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Model</th>
                    <th>Booking Price</th>
                    <th>Specific Vehicles</th>
                  </tr>
                </thead>

                <tbody>
                  {VehicleInventryList.map((group, index) => (
                    <tr key={group._id}>
                      <td>{index + 1} </td>
                      <td>{group.name}</td>
                      <td>{group.vehicleType}</td>
                      <td>{group.model}</td>

                      <td>
                        {group.bookingPrice.map((p) => (
                          <div key={p._id} className={styles.priceRow}>
                            ≤ {p.range} km → ₹{p.price}
                          </div>
                        ))}
                      </td>

                      <td>
                        <div className={styles.vehicleGrid}>
                          {group.specificVehicleDetails.map((v) => (
                            <span
                              key={v.vehicleNumber}
                              className={
                                v.vehicleStatus
                                  ? styles.available
                                  : styles.unavailable
                              }
                            >
                              {v.vehicleNumber}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!VehicleInventryList.length && (
                <div className={styles.empty}>
                  No vehicle VehicleInventryList found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* <div className={styles.page}> */}
      {/* <div className={styles.container}> */}
      {/* --------- CHART --------- */}
      {/* <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Vehicle Availability</h3>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  VehicleInventryList={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                >
                  {chartData.map((item, index) => (
                    <Cell key={index} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div> */}
      {/* </div> */}
      {/* </div> */}
    </>
  );
};

export default VehicleInventoryReport;
