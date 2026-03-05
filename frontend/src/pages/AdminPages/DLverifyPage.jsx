import React, { useEffect, useState, useCallback } from "react";
import styles from "./adminPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDLlistdata,
  handleDLApproval,
} from "../../appRedux/redux/adminSlice/AdminRoleSlice";
import { Check, X } from "lucide-react";

const DLverifyPage = () => {
  const dispatch = useDispatch();

  const {
    userDlDataList,
    userDlverifyResponse,
    userDlverifyResponseError,
    userDlverifyResponseLoading,
  } = useSelector((state) => state.adminData);

  /* ---------- Preview State ---------- */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState("image"); // image | pdf

  /* ---------- Fetch DL List ---------- */
  useEffect(() => {
    dispatch(fetchDLlistdata());
  }, [dispatch]);

  /* ---------- Preview Handler ---------- */
  const handlePreview = useCallback((url) => {
    if (!url) return;

    setPreviewType(url.toLowerCase().endsWith(".pdf") ? "pdf" : "image");
    setPreviewUrl(url);
    setPreviewOpen(true);
  }, []);

  /* ---------- Approve DL ---------- */
  const handleApprove = (userID) => {
    if (!userID || userDlverifyResponseLoading) return;
    dispatch(handleDLApproval(userID));
  };

  /* ---------- Side Effects ---------- */
  useEffect(() => {
    if (userDlverifyResponse) {
      // 🔔 plug toast here later
      console.log("SUCCESS:", userDlverifyResponse);
    }

    if (userDlverifyResponseError) {
      console.error("ERROR:", userDlverifyResponseError);
    }
  }, [userDlverifyResponse, userDlverifyResponseError]);

  return (
    <>
      {/* ================= TABLE ================= */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Alt Phone</th>
              <th>DL Number</th>
              <th>Status</th>
              <th>User Photo</th>
              <th>DL File</th>
              <th>Approve</th>
              <th>Reject</th>
            </tr>
          </thead>

          <tbody>
            {userDlDataList.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber || "-"}</td>
                <td>{user.altMobileNumber || "-"}</td>
                <td>{user.drivingLicenceNumber}</td>
                <td>{user.isDLverify ? "Verified" : "Pending"}</td>

                <td>
                  <span
                    className={styles.previewLink}
                    onClick={() => handlePreview(user.filePath)}
                  >
                    View
                  </span>
                </td>

                <td>
                  {user.drivingLicenceFilePath?.length ? (
                    <span
                      className={styles.previewLink}
                      onClick={() =>
                        handlePreview(user.drivingLicenceFilePath[0])
                      }
                    >
                      View
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                {/* ---------- Approve ---------- */}
                <td className={styles.list_button}>
                  <button
                    disabled={userDlverifyResponseLoading}
                    onClick={() => handleApprove(user._id)}
                  >
                    <Check
                      size={20}
                      className={styles.icon_green}
                    />
                  </button>
                </td>

                {/* ---------- Reject (future) ---------- */}
                <td className={styles.list_button}>
                  <button disabled>
                    <X size={20} className={styles.icon_reject} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!userDlDataList.length && (
          <div className={styles.emptyState}>
            No pending DL verification found
          </div>
        )}
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      {previewOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.groupHeader}>
              <h4>Document Preview</h4>
              <button onClick={() => setPreviewOpen(false)}>✕</button>
            </div>

            <div className={styles.previewContainer}>
              {previewType === "image" ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={styles.previewImage}
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  className={styles.previewIframe}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DLverifyPage;
