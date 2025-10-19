import React, { useEffect, useState, useRef } from "react";
import NavBarStyle from "./NavBar.module.css";
import { useNavigate } from "react-router-dom";

import { Server_API } from "../../APIPoints/AllApiPonts";
import Logo from "../../assest/logo3.png";

import { useToast } from "../../ContextApi/ToastContext";

import { useSocket } from "../../ContextApi/NotificationContentAPI";
import { Bell, Check, Lock, Calendar, LogOut, ChevronDown } from "lucide-react";
import api from "../../axiosInterceptors/AxiosSetup";

const NavBar = ({ loading, userDetails, logout }) => {
  const { handleShowToast } = useToast();
  const { notifications } = useSocket();

  const [NotificationContent, setNotificationContent] = useState([]);
  const [NotificationContentBox, setNotificationContentBox] = useState(false);
  const [NotificationCount, setNotificationCount] = useState(0);

  const navigate = useNavigate();
  // const [userDetailsModel, setuserDetailsModel] = useState(true);
  const profileRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const handleChangePassword = () => {
    navigate("/changepassword");
  };

  const handleBookingList = () => {
    navigate("/bookinglist");
  };

  const handleLogout = () => {
    logout();
  };

  // ✅ Don’t call functions directly — just reference them
  const menuItems = [
    {
      icon: Lock,
      label: "Change Password",
      color: NavBarStyle.textGray,
      onClick: handleChangePassword,
    },
    {
      icon: Calendar,
      label: "Bookings",
      color: NavBarStyle.textGray,
      onClick: handleBookingList,
    },
    {
      icon: LogOut,
      label: "Logout",
      color: NavBarStyle.textRed,
      onClick: handleLogout,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetContact = () => {
    navigate("/contactus");
  };
  const handleAddVehicle = () => {
    navigate("/addvehicle");
  };
  const handlenavigateHomePage = () => {
    navigate("/");
  };

  const HandleGetAllNotofication = async () => {
    if (userDetails?.email) {
      try {
        const response = await api.get(
          `${Server_API}/notification`,

          { withCredentials: true }
        );
        const data = response.data.data;
        setNotificationContent(data);
        const isReadCount = data.filter((item) => item.isRead === false).length;
        setNotificationCount(isReadCount);
      } catch (error) {}
    } // Ensure userDetails is available before making the request
  };
  useEffect(() => {
    HandleGetAllNotofication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetails]);

  const handleNotificationBox = () => {
    setNotificationContentBox(true);
  };
  const notificationRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationContentBox(false);
      }
    };

    if (NotificationContentBox) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [NotificationContentBox]);

  const handleReadNotificationOneByOne = async (notificationId) => {
    try {
      await api.post(
        `${Server_API}/readNotifications`,
        {
          notificationId: notificationId,
          isRead: true,
        },
        {
          withCredentials: true,
        }
      );
      HandleGetAllNotofication();
    } catch (error) {
      console.error("Error reading notification:", error);
    }
  };
  const handleReadALLNotification = async () => {
    try {
      await api.post(
        `${Server_API}/readAllNotifications`,
        {
          isRead: true,
        },
        {
          withCredentials: true,
        }
      );
      HandleGetAllNotofication();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to mark all notifications as read.";
      handleShowToast("danger", errorMessage);
    }
  };

  const handleNavigate = () => {
    navigate("/login");
  };

  const unReadNotificationCount = NotificationContent.filter(
    (n) => !n.isRead
  ).length;

  /* ====== Comments (Use) :- Return time difference ===== */
  function getTimeDifference(databaseTime) {
    const dbDate = new Date(databaseTime);
    const now = new Date();

    // Calculate difference in milliseconds
    const diffMs = now - dbDate;

    // Convert to minutes
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""}`;
    }

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours !== 1 ? "s" : ""}`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }

  return (
    <>
      <div className={NavBarStyle.navbarpage_Main_Container}>
        <div className={NavBarStyle.navbarpage_Main_Container_Content}>
          <div className={NavBarStyle.navbarpage_Content_LogoSection}>
            <button
              className={NavBarStyle.navbarpage_Image_Boxes}
              style={{ border: "none", background: "transparent" }}
              onClick={handlenavigateHomePage}
            >
              <img src={Logo} alt="GoGear" />
            </button>
          </div>

          <div
            className={NavBarStyle.navbarpage_Content_Boxes_navButtonSection}
          >
            <div className={NavBarStyle.navbarOptions}>
              <button
                onClick={handleGetContact}
                className={NavBarStyle.navbarpage_Button}
              >
                {" "}
                Contact US{" "}
              </button>
              {(userDetails?.userType === "admin" ||
                userDetails?.userType === "user") && (
                <>
                  <button
                    onClick={() => navigate("/vehiclemanagement")}
                    className={NavBarStyle.navbarpage_Button}
                  >
                    {" "}
                    Vehicle Management{" "}
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    className={NavBarStyle.navbarpage_Button}
                  >
                    {" "}
                    Add Vehicle{" "}
                  </button>
                </>
              )}
            </div>

            <div className={NavBarStyle.navbarpage_Content_Profile_Box}>
              <div className={NavBarStyle.navbarpage_Content_Notification_Box}>
                <button
                  onClick={handleNotificationBox}
                  className={NavBarStyle.navbarpage_Content_NotificationBoxes}
                >
                  <h1>🔔</h1>
                  <p>{NotificationCount}</p>
                </button>
                {NotificationContentBox && (
                  <div
                    className={NavBarStyle.navbarpage_NotificationContainerBox}
                    ref={notificationRef}
                  >
                    <div
                      className={`${NavBarStyle.card} ${NavBarStyle.notification_card}`}
                    >
                      <div className={NavBarStyle.card_header_row}>
                        <div>
                          <h1>Notifications</h1>
                          <p>
                            {NotificationContent.length === 0
                              ? "No notifications"
                              : `${unReadNotificationCount} unread notifications`}
                          </p>
                        </div>
                        {NotificationContent.length > 0 && (
                          <button
                            onClick={handleReadALLNotification}
                            className={NavBarStyle.mark_all_btn}
                          >
                            <Check className={NavBarStyle.icon_small} />
                            Mark All Read
                          </button>
                        )}
                      </div>

                      {/* lIVE NOTIFICATION LIST  */}

                      {notifications && (
                        <div className={NavBarStyle.notif_list}>
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`${NavBarStyle.notif_item} ${
                                n.isRead ? `${NavBarStyle.isRead}` : ""
                              }`}
                            >
                              <div
                                className={`${NavBarStyle.notif_item} ${
                                  n.isRead
                                    ? `${NavBarStyle.blue}`
                                    : `${NavBarStyle.gray}`
                                }`}
                              >
                                <Bell className={NavBarStyle.icon_white} />
                              </div>
                              <div className={NavBarStyle.notif_content}>
                                <div className={NavBarStyle.notif_header}>
                                  <h3>{n.title}</h3>
                                </div>
                                <p>{n.message}</p>
                                <div className={NavBarStyle.notif_footer}>
                                  <span>{getTimeDifference(n.createdAt)} </span>
                                  {n.isRead && (
                                    <span className={NavBarStyle.badge}>
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* DATA BSE NOTIFICATION LIST  */}
                      {NotificationContent.length === 0 ? (
                        <div className={NavBarStyle.no_notifications}>
                          <div className={NavBarStyle.empty_icon}>
                            <Bell />
                          </div>
                          <p>No notifications yet</p>
                          <small>
                            We'll notify you when something new arrives
                          </small>
                        </div>
                      ) : (
                        <div className={NavBarStyle.notif_list}>
                          {NotificationContent.map((n, index) => (
                            <div
                              key={index}
                              className={`${NavBarStyle.notif_item} ${
                                !n.isRead ? `${NavBarStyle.isRead}` : ""
                              }`}
                              onClick={() =>
                                handleReadNotificationOneByOne(n.notificationId)
                              }
                            >
                              <div
                                className={`${NavBarStyle.notif_item} ${
                                  !n.isRead
                                    ? `${NavBarStyle.blue}`
                                    : `${NavBarStyle.gray}`
                                }`}
                              >
                                <Bell className={NavBarStyle.icon_white} />
                              </div>
                              <div className={NavBarStyle.notif_content}>
                                <div className={NavBarStyle.notif_header}>
                                  <h3>{n.title}</h3>
                                  {/* <button
                                    onClick={() => removeNotification(n.id)}
                                    className={NavBarStyle.remove_btn}
                                  >
                                    <X />
                                  </button> */}
                                </div>
                                <p>{n.message}</p>
                                <div className={NavBarStyle.notif_footer}>
                                  <span>{getTimeDifference(n.createdAt)} </span>
                                  {!n.isRead && (
                                    <span className={NavBarStyle.badge}>
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {!userDetails?.email ? (
                    <div className={NavBarStyle.navbarpage_Content_Boxes}>
                      <button
                        onClick={handleNavigate}
                        className={NavBarStyle.LoginButton}
                      >
                        LogIn
                      </button>
                    </div>
                  ) : (
                    <div className={NavBarStyle.dropdownWrapper}>
                      <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={NavBarStyle.profileButton}
                      >
                        Profile
                        <ChevronDown
                          className={`${NavBarStyle.chevronIcon} ${
                            isOpen ? NavBarStyle.chevronRotate : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div
                          className={NavBarStyle.dropdownMenu}
                          ref={profileRef}
                        >
                          <div className={NavBarStyle.dropdownHeader}>
                            <p className={NavBarStyle.welcomeText}>Welcome :</p>
                            <p className={NavBarStyle.welcomeName}>
                              {userDetails?.name}
                            </p>
                          </div>

                          <div className={NavBarStyle.menuList}>
                            {menuItems.map((item, index) => (
                              <button
                                key={index}
                                onClick={item.onClick}
                                className={`${NavBarStyle.menuItem} ${
                                  item.label === "Logout"
                                    ? NavBarStyle.logoutBorder
                                    : ""
                                }`}
                              >
                                <div
                                  className={`${NavBarStyle.menuIconWrapper} ${
                                    item.label === "Logout"
                                      ? NavBarStyle.bgRedLight
                                      : NavBarStyle.bgBlueLight
                                  }`}
                                >
                                  <item.icon
                                    size={16}
                                    className={`${NavBarStyle.menuIcon} ${
                                      item.label === "Logout"
                                        ? NavBarStyle.textRed
                                        : NavBarStyle.textBlue
                                    }`}
                                  />
                                </div>
                                <span
                                  className={`${NavBarStyle.menuLabel} ${item.color}`}
                                >
                                  {item.label}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className={NavBarStyle.dropdownBottom}></div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
