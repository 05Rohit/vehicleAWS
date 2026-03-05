import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  User,
  Lock,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Send,
  LoaderCircle,
  FileTerminal,
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
  FileImage,
} from "lucide-react";
import styles from "./profileSection.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfileInfo,
  updateProfileDetails,
  resetUpdateProfileState,
  uploadDrivingLicenceImage,
} from "../../appRedux/redux/authSlice/myProfileSlice";
import { useToast } from "../../ContextApi/ToastContext";
import Modal from "./FileUploadModal.jsx";
import api from "../../axiosInterceptors/AxiosSetup.js";

const MyProfile = () => {
  const { handleShowToast } = useToast();
  const { unreadCount } = useSelector((state) => state.notificationData);
  const [open, setOpen] = useState(false); // For Modal

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const dispatch = useDispatch();

  const {
    // profileLoading,
    updateProfileLoading,
    drivingLicenceUploadLoading,
    // verifyDLLoading,

    userProfileInfo,
    updateProfileResponse,
    drivingLicenceUploadResponse,
    // verifyDLResponse,

    // profileError,
    updateProfileError,
    drivingLicenceUploadError,
    // verifyDLError,
  } = useSelector((state) => state.userProfile);

  useEffect(() => {
    dispatch(fetchUserProfileInfo());
  }, [dispatch]);

  const [activeEdit, setActiveEdit] = useState(false);

  const handleGetMyProfile = async () => {};

  useEffect(() => {
    handleGetMyProfile();
  }, []);

  useEffect(() => {
    if (userProfileInfo) {
      setFormData({
        name: userProfileInfo.name || "",
        email: userProfileInfo.email || "",
        phoneNumber: userProfileInfo.phoneNumber || "",
        altMobileNumber: userProfileInfo.altMobileNumber || "",
        drivingLicenceNumber: userProfileInfo.drivingLicenceNumber || "",
        currentLocation: userProfileInfo.currentLocation || "",
      });
    }
  }, [userProfileInfo]);

  const handleEditClick = () => {
    setActiveEdit((prev) => !prev);
  };

  const [formData, setFormData] = useState({});
  const [loader, setLoader] = useState(false);
  const handleChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    // Allow only alphabets and spaces for location
    if (name === "currentLocation" || name === "name") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }
    if (name === "altMobileNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoader(true);
    try {
      await dispatch(updateProfileDetails(formData)).unwrap();
      dispatch(fetchUserProfileInfo());
      setActiveEdit(false);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoader(false);
    }
  };

  // const renderField = (name, value) =>
  //   activeEdit ? (
  //     <input
  //       name={name}
  //       value={formData[name] ?? ""}
  //       onChange={handleChange}
  //       className={styles.input}
  //       readOnly={false}
  //     />
  //   ) : (
  //     <div className={styles.value}>{value || "N/A"}</div>
  //   );

  const renderField = (name, value) => {
    // 🔒 Always read-only fields
    const readOnlyFields = ["isDLverify", "email", "phoneNumber"];

    // If field is read-only → always show text
    if (readOnlyFields.includes(name)) {
      return <div className={styles.value}>{value}</div>;
    }

    // Editable fields
    return activeEdit ? (
      <input
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        className={styles.input}
      />
    ) : (
      <div className={styles.value}>{value || "N/A"}</div>
    );
  };

  useEffect(() => {
    dispatch(fetchUserProfileInfo());

    return () => {
      // CLEANUP on unmount
      dispatch(resetUpdateProfileState());
    };
  }, [dispatch]);

  // Handle cancel edit
  const handleCancelEdit = () => {
    setActiveEdit(false);

    // reset form to original data
    setFormData({
      name: userProfileInfo.name || "",
      altMobileNumber: userProfileInfo.altMobileNumber || "",
      drivingLicenceNumber: userProfileInfo.drivingLicenceNumber || "",
      currentLocation: userProfileInfo.currentLocation || "",
    });

    dispatch(resetUpdateProfileState());
  };

  useEffect(() => {
    if (updateProfileResponse) {
      handleShowToast("success", updateProfileResponse);
      dispatch(resetUpdateProfileState());
    }

    if (updateProfileError) {
      handleShowToast("error", updateProfileError);
      dispatch(resetUpdateProfileState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateProfileResponse, updateProfileError, dispatch]);

  /* Below is the code for Upload the File with good UI*/
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // File select handler
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

  // Drag over handler
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Drag leave handler
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Drop handler
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Utility to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Upload Driving Licence Image for the verification
  const handleUploadDrivingLicnece = () => {
    if (!selectedFile) {
      handleShowToast("error", "Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("files", selectedFile); // backend key name
    dispatch(uploadDrivingLicenceImage(formData));
  };

  useEffect(() => {
    if (drivingLicenceUploadResponse) {
      handleShowToast("success", drivingLicenceUploadResponse);
      setSelectedFile(null);
      setOpen(false);
    }
    if (drivingLicenceUploadError) {
      handleShowToast("error", drivingLicenceUploadError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivingLicenceUploadResponse, drivingLicenceUploadError]);

  // Preview the Deiving Licence of the user in new tab

  const handleDownloadDocument = async () => {
    try {
      const res = await api.get("/downloadDrivingLicence", {
        withCredentials: true,
      });

      const fileUrl = res.data.fileUrl;

      if (!fileUrl) {
        handleShowToast("error", "File not found");
        return;
      }

      // ✅ Open in new tab for preview
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      handleShowToast("error", "Unable to preview document");
    }
  };

  //This is used to download the User Driving Licence
  //   const handleDownloadDocument = async () => {
  //   try {
  //     const res = await api.get("/downloadDrivingLicence", {
  //       withCredentials: true,
  //     });

  //     const fileUrl = res.data.fileUrl;

  //     const fileResponse = await fetch(fileUrl);
  //     const blob = await fileResponse.blob();

  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");

  //     link.href = url;
  //     link.download = "driving-licence";
  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     handleShowToast("error", "Unable to download document");
  //   }
  // };

  // For Upload Profile Image
  // Profile Image Modal
  const [openProfileImageModal, setOpenProfileImageModal] = useState(false);

  // Upload states

  const [profileImageUploadLoading, setProfileImageUploadLoading] =
    useState(false);

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) validateProfileImage(file);
  };

  const validateProfileImage = (file) => {
    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG and PNG images are allowed");
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadProfileImage = async () => {
    if (!selectedFile) return;

    try {
      setProfileImageUploadLoading(true);

      const formData = new FormData();
      formData.append("files", selectedFile);

      // 🔴 Replace with real API
      await api.post("/uploadProfilePhoto", formData, {
        withCredentials: true,
      });

      setOpenProfileImageModal(false);
      handleRemoveFile();
      dispatch(fetchUserProfileInfo());

      handleShowToast("success", "Profile image upload successfully");
    } catch (error) {
      handleShowToast("error", "Profile image upload failed");
    } finally {
      setProfileImageUploadLoading(false);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Header Section */}
          <div className={styles.headerCard}>
            <div className={styles.profileInfo}>
              <div className={styles.profileAvatar_info}>
                <div className={styles.profileAvatar}>
                  <User className={styles.userIcon} />
                </div>
                <div>
                  <h1 className={styles.userName}>{userProfileInfo?.name} </h1>
                  <p className={styles.userEmail}>{userProfileInfo?.email} </p>
                </div>
              </div>
              <div className={styles.userProfilePhoto}>
                <img
                  src={userProfileInfo?.filePath}
                  alt=""
                  width="80px"
                  height="80px"
                />
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Total Bookings</h3>
                <div className={`${styles.iconBox} ${styles.bgBlueLight}`}>
                  <Calendar className={styles.textBlue} />
                </div>
              </div>
              <p className={`${styles.cardNumber} ${styles.textBlue}`}>
                {userProfileInfo?.bookingInfo?.totalBooking}{" "}
              </p>
              <p className={styles.cardSubtitle}>Current rentals</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Active Bookings</h3>
                <div className={`${styles.iconBox} ${styles.bgBlueLight}`}>
                  <Calendar className={styles.textBlue} />
                </div>
              </div>
              <p className={`${styles.cardNumber} ${styles.textBlue}`}>
                {userProfileInfo?.bookingInfo?.activeBooking}{" "}
              </p>
              <p className={styles.cardSubtitle}>Current rentals</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Total Spent</h3>
                <div className={`${styles.iconBox} ${styles.bgGreenLight}`}>
                  <span
                    className={`${styles.currencySymbol} ${styles.textGreen}`}
                  >
                    ₹
                  </span>
                </div>
              </div>
              <p className={`${styles.cardNumber} ${styles.textGreen}`}>
                ₹{userProfileInfo?.bookingInfo?.moneySpend}{" "}
              </p>
              <p className={styles.cardSubtitle}>Monry Spend</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Notifications</h3>
                <div className={`${styles.iconBox} ${styles.bgOrangeLight}`}>
                  <Bell className={styles.textOrange} />
                </div>
              </div>
              <p className={`${styles.cardNumber} ${styles.textOrange}`}>
                {unreadCount}
              </p>
              <p className={styles.cardSubtitle}>Unread messages</p>
            </div>
          </div>

          {/* USER info Section */}

          <div className={styles.UserInfocard}>
            <div className={styles.header}>
              <h2 className={styles.title}>Profile Information</h2>
              {activeEdit ? (
                <button
                  className={styles.editButton}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              ) : (
                <button className={styles.editButton} onClick={handleEditClick}>
                  Edit Profile
                </button>
              )}
            </div>

            <div className={styles.grid}>
              <div className={styles.group}>
                <label className={styles.label}>
                  <User className={styles.icon} /> Full Name
                </label>
                {renderField("name", userProfileInfo?.name)}
              </div>

              <div className={styles.group}>
                <label className={styles.label}>
                  <Mail className={styles.icon} /> Email Address
                </label>
                {/* <div className={styles.value}>{userProfileInfo?.email}</div> */}
                {renderField("email", userProfileInfo?.email)}
              </div>

              <div className={styles.group}>
                <label className={styles.label}>
                  <Phone className={styles.icon} /> Contact Number
                </label>
                {/* <div className={styles.value}>
                  {userProfileInfo?.phoneNumber}
                </div> */}
                {renderField("phoneNumber", userProfileInfo?.phoneNumber)}
              </div>

              <div className={styles.group}>
                <label className={styles.label}>
                  <Phone className={styles.icon} /> Alternative Number
                </label>
                {renderField(
                  "altMobileNumber",
                  userProfileInfo?.altMobileNumber
                )}
              </div>

              <div className={styles.group}>
                <label className={styles.label}>
                  <CreditCard className={styles.icon} /> Driving License Number
                </label>
                {renderField(
                  "drivingLicenceNumber",
                  userProfileInfo?.drivingLicenceNumber
                )}
              </div>

              <div className={styles.group}>
                <label className={styles.label}>
                  <MapPin className={styles.icon} /> Location
                </label>
                {renderField(
                  "currentLocation",
                  userProfileInfo?.currentLocation
                )}
              </div>
              <div className={styles.group}>
                <label className={styles.label}>
                  <FileTerminal className={styles.icon} /> Driving Licence
                  verification Status
                </label>
                {renderField(
                  "isDLverify",
                  userProfileInfo?.isDLverify
                    ? "Successfully Verify"
                    : "Pending"
                )}
              </div>
            </div>

            <div className={styles.actions}>
              {activeEdit ? (
                <button
                  className={styles.actionButton}
                  onClick={handleSave}
                  disabled={updateProfileLoading}
                >
                  {loader ? (
                    <LoaderCircle
                      className={styles.loaderIcon}
                      color="#b95809"
                    />
                  ) : (
                    <Send className={styles.actionIcon} />
                  )}
                  {updateProfileLoading ? "Saving..." : "Save"}
                </button>
              ) : (
                <>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleNavigate("/changepassword")}
                  >
                    <Lock className={styles.actionIcon} />
                    Change Password
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => setOpen(true)}
                  >
                    <CreditCard className={styles.actionIcon} />
                    Update Documents
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => setOpenProfileImageModal(true)}
                  >
                    <CreditCard className={styles.actionIcon} />
                    Change Profile Picture
                  </button>

                  <button
                    className={styles.actionButton}
                    onClick={handleDownloadDocument}
                    disabled={drivingLicenceUploadLoading}
                  >
                    <FileImage className={styles.actionIcon} />
                    Preview DL
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}

          <div className={styles.quickActions}>
            <h2 className={styles.quickTitle}>Quick Actions</h2>
            <div className={styles.quickGrid}>
              <button className={`${styles.quickBtn} ${styles.bgBlueLight}`}>
                <Calendar
                  className={`${styles.quickIcon} ${styles.textBlue}`}
                />
                <p className={styles.quickLabel}>New Booking</p>
              </button>
              {/* <button className={`${styles.quickBtn} ${styles.bgGreenLight}`}>
              <Lock className={`${styles.quickIcon} ${styles.textGreen}`} />
              <p className={styles.quickLabel}>Security</p>
            </button> */}
              {/* <button className={`${styles.quickBtn} ${styles.bgPurpleLight}`}>
              <User className={`${styles.quickIcon} ${styles.textPurple}`} />
              <p className={styles.quickLabel}>Profile</p>
            </button> */}
              <button className={`${styles.quickBtn} ${styles.bgOrangeLight}`}>
                <Bell className={`${styles.quickIcon} ${styles.textOrange}`} />
                <p className={styles.quickLabel}>Alerts</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOR Upload the Driving Licence Document */}

      <Modal
        isOpen={open}
        title="My Modal Title"
        onClose={() => setOpen(false)}
      >
        <div className={styles.page}>
          <div className={styles.Uplaodcontainer}>
            {/* Header */}
            <div className={styles.UploadHeader}>
              <div className={styles.UploadIconBox}>
                <FileText />
              </div>
              <div>
                <p>Upload your driving licence for verification</p>
              </div>
            </div>

            {/* Upload Card */}
            <div className={styles.Boxcard}>
              <div
                className={`${styles.dropZone} 
                  ${isDragging ? styles.dragging : ""} 
                  ${selectedFile ? styles.success : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  hidden
                  id="file-upload"
                />

                {!selectedFile ? (
                  <label htmlFor="file-upload" className={styles.uploadContent}>
                    <div className={styles.uploadIcon}>
                      <Upload />
                    </div>
                    <h4>
                      {isDragging
                        ? "Drop your file here"
                        : "Choose File or Drag & Drop"}
                    </h4>
                    <p>Supported formats: PDF, JPG, PNG (Max 10MB)</p>
                    <button type="button" className={styles.primaryBtn}>
                      Browse Files
                    </button>
                  </label>
                ) : (
                  <div className={styles.fileInfo}>
                    <div className={styles.fileIcon}>
                      <FileText />
                    </div>
                    <div className={styles.fileDetails}>
                      <h4>{selectedFile.name}</h4>
                      <p>{formatFileSize(selectedFile.size)}</p>
                      <div className={styles.successMsg}>
                        <Check /> File uploaded successfully
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className={styles.removeBtn}
                    >
                      <X />
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={styles.infoBox}>
                <AlertCircle />
                <div>
                  <strong>Important Information</strong>
                  <p>
                    Please ensure your driving licence is valid and all details
                    are clearly visible.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.UploadActions}>
                <button
                  disabled={!selectedFile || drivingLicenceUploadLoading}
                  className={`${styles.submitBtn} ${
                    !selectedFile || drivingLicenceUploadLoading
                      ? styles.disabled
                      : ""
                  }`}
                  onClick={handleUploadDrivingLicnece}
                >
                  Submit Document
                </button>
                <button onClick={handleRemoveFile} className={styles.clearBtn}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* For Profile Photo Update */}
      <Modal
        isOpen={openProfileImageModal}
        title="Upload Profile Picture"
        onClose={() => setOpenProfileImageModal(false)}
      >
        <div className={styles.page}>
          <div className={styles.Uplaodcontainer}>
            {/* Header */}
            <div className={styles.UploadHeader}>
              <div className={styles.UploadIconBox}>
                <User />
              </div>
              <div>
                <p>Upload your profile picture</p>
              </div>
            </div>

            {/* Upload Card */}
            <div className={styles.Boxcard}>
              <div
                className={`${styles.dropZone} 
            ${isDragging ? styles.dragging : ""} 
            ${selectedFile ? styles.success : ""}`}
                style={{ width: 170, height: 170 }} // 👈 170x170
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleProfileImageSelect}
                  hidden
                  id="profile-upload"
                />

                {!selectedFile ? (
                  <label
                    htmlFor="profile-upload"
                    className={styles.uploadContent}
                  >
                    <div className={styles.uploadIcon}>
                      <Upload />
                    </div>
                    <p>JPEG or PNG only</p>
                    <small>170 × 170 px recommended</small>
                  </label>
                ) : (
                  <div className={styles.imagePreviewBox}>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Profile Preview"
                      className={styles.profilePreview}
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={styles.infoBox}>
                <AlertCircle />
                <div>
                  <strong>Important</strong>
                  <p>
                    Only JPEG or PNG images. Image should be clear and recent.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.UploadActions}>
                <button
                  disabled={!selectedFile || profileImageUploadLoading}
                  className={`${styles.submitBtn} ${
                    !selectedFile || profileImageUploadLoading
                      ? styles.disabled
                      : ""
                  }`}
                  onClick={handleUploadProfileImage}
                >
                  Upload
                </button>

                <button onClick={handleRemoveFile} className={styles.clearBtn}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MyProfile;
