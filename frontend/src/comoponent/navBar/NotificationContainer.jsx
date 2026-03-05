import React, { useEffect } from "react";
import NavBarStyle from "./NavBar.module.css";

import {
  markNotificationRead,
  //   markAllNotificationsRead,
  clearError,
} from "../../appRedux/redux/notificationSlice/NotificationSlice";
import { useToast } from "../../ContextApi/ToastContext";
import { useDispatch } from "react-redux";
import { getTimeDifference } from "../../utils/getTimeDifference";
import { Bell } from "lucide-react";
import { useSocket } from "../../ContextApi/NotificationContentAPI";

const NotificationContainer = ({ notificationsList, error }) => {
  const { handleShowToast } = useToast();
  const dispatch = useDispatch();
  const { notifications } = useSocket();

  useEffect(() => {
    if (!error) return;

    handleShowToast("danger", error);
    dispatch(clearError());
  }, [error, dispatch,handleShowToast]);

  const handleReadNotificationOneByOne = (id) => {
    dispatch(markNotificationRead(id)); 
  };

  return (
    <>
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
                  n.isRead ? `${NavBarStyle.blue}` : `${NavBarStyle.gray}`
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
                  {n.isRead && <span className={NavBarStyle.badge}>New</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* DATA BSE NOTIFICATION LIST  */}

      {notificationsList.length === 0 ? (
        <div className={NavBarStyle.no_notifications}>
          <div className={NavBarStyle.empty_icon}>
            <Bell />
          </div>
          <p>No notifications yet</p>
          <small>We'll notify you when something new arrives</small>
        </div>
      ) : (
        <div className={NavBarStyle.notif_list}>
          {notificationsList.map((n, index) => (
            <div
              key={index}
              className={`${NavBarStyle.notif_item} ${
                !n.isRead ? `${NavBarStyle.isRead}` : ""
              }`}
              onClick={() => handleReadNotificationOneByOne(n.notificationId)}
            >
              <div
                className={`${NavBarStyle.notif_item} ${
                  !n.isRead ? `${NavBarStyle.blue}` : `${NavBarStyle.gray}`
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
                  {!n.isRead && <span className={NavBarStyle.badge}>New</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default NotificationContainer;
