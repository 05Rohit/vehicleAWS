import React, { useEffect, useState, useRef } from "react";
import NavBarStyle from "./NavBar.module.css";
import { useNavigate } from "react-router-dom";

import Logo from "../../assest/logo3.png";

import { useToast } from "../../ContextApi/ToastContext";

import {
  Check,
  Lock,
  Calendar,
  LogOut,
  Contact,
  LayoutDashboard,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../appRedux/redux/authSlice/loginSlice";
import { persist } from "../../appRedux/store";

import {
  // fetchNotifications,
  markAllNotificationsRead,
  clearError,
  resetMarkReadSuccess,
  fetchNotifications,
} from "../../appRedux/redux/notificationSlice/NotificationSlice";
import NotificationContainer from "./NotificationContainer";
import ProfileDropdown from "./ProfileDropdown";

const NavBar = ({ loading }) => {
  const handleNavigate = (path) => {
    navigate(path);
  };
  const handleLogout = () => {
    dispatch(logoutUser());
    persist.purge(); // clears persisted storage
  };

  // ✅ Don’t call functions directly — just reference them
  const menuItems = [
    {
      icon: Contact,
      label: "Profile",
      color: NavBarStyle.textGray,
      onClick: () => handleNavigate("/profile"),
    },
    {
      icon: Lock,
      label: "Change Password",
      color: NavBarStyle.textGray,
      onClick: () => handleNavigate("/changepassword"),
    },
    {
      icon: Calendar,
      label: "Bookings",
      color: NavBarStyle.textGray,
      onClick: () => handleNavigate("/bookinglist"),
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      color: NavBarStyle.textGray,
      onClick:()=> handleNavigate("/admin_dashboard"), // 🔴 keep logout separate
    },
    {
      icon: LogOut,
      label: "Logout",
      color: NavBarStyle.textRed,
      onClick: handleLogout, // 🔴 keep logout separate
    },
  ];

  const { handleShowToast } = useToast();
  const dispatch = useDispatch();

  // Get User Data
  const { user } = useSelector((state) => state.login);
  const { unreadCount, error, notificationsList, markReadSuccess } =
    useSelector((state) => state.notificationData);
  useEffect(() => {
    if (!user) return;
    dispatch(fetchNotifications());
  }, [dispatch, user]);

  const [NotificationContentBox, setNotificationContentBox] = useState(false);

  useEffect(() => {
    if (!error) return;

    handleShowToast("danger", error);
    dispatch(clearError());
  }, [error, dispatch, handleShowToast]);

  // It is used for when we mark Notification Read and then fetch all Notification again
  useEffect(() => {
    if (!markReadSuccess) return;
    dispatch(fetchNotifications());
    dispatch(resetMarkReadSuccess());
  }, [markReadSuccess, dispatch]);

  const handleReadALLNotification = () => {
    dispatch(markAllNotificationsRead());
  };

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationBox = (e) => {
    e.stopPropagation();
    setNotificationContentBox((prev) => !prev);
  };

  // toggle notification and profile section
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Make close the Profile Dropdown when we click outsidew
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationContentBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className={NavBarStyle.navbarpage_Main_Container}>
        <div className={NavBarStyle.navbarpage_Main_Container_Content}>
          <div className={NavBarStyle.navbarpage_Content_LogoSection}>
            <button
              className={NavBarStyle.navbarpage_Image_Boxes}
              style={{ border: "none", background: "transparent" }}
              onClick={() => handleNavigate("/")}
            >
              <img src={Logo} alt="GoGear" />
            </button>
          </div>

          <div
            className={NavBarStyle.navbarpage_Content_Boxes_navButtonSection}
          >
            <div className={NavBarStyle.navbarOptions}>
              <button
                onClick={() => handleNavigate("/contactus")}
                className={NavBarStyle.navbarpage_Button}
              >
                {" "}
                Contact US{" "}
              </button>
              {(user?.userType === "admin" || user?.userType === "user") && (
                <>
                  <button
                    onClick={() => navigate("/vehiclemanagement")}
                    className={NavBarStyle.navbarpage_Button}
                  >
                    {" "}
                    Vehicle Management{" "}
                  </button>
                  <button
                    onClick={() => handleNavigate("/addvehicle")}
                    className={NavBarStyle.navbarpage_Button}
                  >
                    {" "}
                    Add Vehicle{" "}
                  </button>
                </>
              )}
            </div>

            {/* Notification Section dropDown  */}

            <div
              className={NavBarStyle.navbarpage_Content_Notification_Box}
              ref={notificationRef}
            >
              <button
                onClick={(e) => handleNotificationBox(e)}
                className={NavBarStyle.navbarpage_Content_NotificationBoxes}
              >
                <h1>🔔</h1>
                <p>{unreadCount}</p>
              </button>

              {NotificationContentBox && (
                <div
                  className={NavBarStyle.navbarpage_NotificationContainerBox}
                >
                  <div
                    className={`${NavBarStyle.card} ${NavBarStyle.notification_card}`}
                  >
                    <div className={NavBarStyle.card_header_row}>
                      <div>
                        <h1>Notifications</h1>
                        <p>
                          {unreadCount
                            ? "No notifications"
                            : `${unreadCount} unread notifications`}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleReadALLNotification}
                          className={NavBarStyle.mark_all_btn}
                        >
                          <Check className={NavBarStyle.icon_small} />
                          Mark All Read
                        </button>
                      )}
                    </div>

                    {/*Showing The Nofication List*/}
                    <NotificationContainer
                      notificationsList={notificationsList}
                      error={error}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropDown  */}
            <ProfileDropdown
              loading={loading}
              user={user}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              profileRef={profileRef}
              menuItems={menuItems}
              handleNavigate={handleNavigate}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
