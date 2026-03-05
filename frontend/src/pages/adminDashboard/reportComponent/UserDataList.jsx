import React, { useState, useEffect, useMemo } from "react";
import styles from "../DashBoard.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUserListData } from "../../../appRedux/redux/reportSlice/adminReportSlice";
import { UserRound, X } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";

const UserDataList = () => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const dispatch = useDispatch();

  const userDataList = useSelector(
    (state) => state.adminReportData?.userList || []
  );

  useEffect(() => {
    dispatch(fetchAllUserListData());
  }, [dispatch]);

  /* Handle Close the Model with effect */
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200); // must match animation duration
  };

  return (
    <>
      {" "}
      <div
        className={`${styles.kpiCard} ${styles.purple}`}
        onClick={() => setOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <UserRound /> <h4>User Deatils</h4>
        <p>{userDataList.length}</p>
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
                    <th>Email Id</th>
                    <th>Contact Number</th>
                    <th>Driving Licence Number</th>
                    <th>DL Verify</th>
                    <th>Total Booking</th>
                    <th>Active Booking</th>
                    <th>Cancelled Booking</th>
                    <th>Money Spend</th>

                    <th>Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {userDataList.map((val, index) => (
                    <tr key={val.id}>
                      <td>{index + 1}</td>
                      <td>{val.name}</td>
                      <td>{val.email}</td>
                      <td>{val.phoneNumber}</td>
                      <td>{val.drivingLicenceNumber}</td>
                      <td>{val.isDLverify}</td>
                      <td>{val.totalBooking}</td>
                      <td>{val.activeBooking}</td>
                      <td>{val.cancelbooking}</td>
                      <td>{val.moneySpend}</td>
                      <td> {formatDate(val.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!userDataList.length && (
                <div className={styles.empty}>No User found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDataList;
