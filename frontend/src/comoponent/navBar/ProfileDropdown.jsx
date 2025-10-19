import React, { useState } from "react";
import { Bell, User, Lock, Calendar, LogOut, ChevronDown } from "lucide-react";
import styles from "./ProfileDropdown.module.css";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [notifications, setNotifications] = useState(1);

  const menuItems = [
    { icon: Lock, label: "Change Password", color: styles.textGray },
    { icon: Calendar, label: "Bookings", color: styles.textGray },
    { icon: LogOut, label: "Logout", color: styles.textRed },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header Section */}
        <div className={styles.headerCard}>
          <div className={styles.headerFlex}>
            <div className={styles.profileInfo}>
              <div className={styles.profileAvatar}>
                <User className={styles.userIcon} />
              </div>
              <div>
                <h1 className={styles.userName}>Rohit Singh</h1>
                <p className={styles.userEmail}>rohitkumar791975@gmail.com</p>
              </div>
            </div>

            {/* Profile Button with Dropdown */}
            <div className={styles.dropdownWrapper}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.profileButton}
              >
                <div className={styles.bellWrapper}>
                  <Bell className={styles.bellIcon} />
                  {notifications > 0 && (
                    <span className={styles.notificationBadge}>
                      {notifications}
                    </span>
                  )}
                </div>
                Profile
                <ChevronDown
                  className={`${styles.chevronIcon} ${
                    isOpen ? styles.chevronRotate : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <p className={styles.welcomeText}>Welcome :</p>
                    <p className={styles.welcomeName}>Rohit Singh</p>
                  </div>

                  <div className={styles.menuList}>
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        className={`${styles.menuItem} ${
                          item.label === "Logout" ? styles.logoutBorder : ""
                        }`}
                      >
                        <div
                          className={`${styles.menuIconWrapper} ${
                            item.label === "Logout"
                              ? styles.bgRedLight
                              : styles.bgBlueLight
                          }`}
                        >
                          <item.icon
                            className={`${styles.menuIcon} ${
                              item.label === "Logout"
                                ? styles.textRed
                                : styles.textBlue
                            }`}
                          />
                        </div>
                        <span
                          className={`${styles.menuLabel} ${item.color}`}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className={styles.dropdownBottom}></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Active Bookings</h3>
              <div className={`${styles.iconBox} ${styles.bgBlueLight}`}>
                <Calendar className={styles.textBlue} />
              </div>
            </div>
            <p className={`${styles.cardNumber} ${styles.textBlue}`}>3</p>
            <p className={styles.cardSubtitle}>Current rentals</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Spent</h3>
              <div className={`${styles.iconBox} ${styles.bgGreenLight}`}>
                <span className={`${styles.currencySymbol} ${styles.textGreen}`}>
                  ₹
                </span>
              </div>
            </div>
            <p className={`${styles.cardNumber} ${styles.textGreen}`}>₹1,770</p>
            <p className={styles.cardSubtitle}>This month</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Notifications</h3>
              <div className={`${styles.iconBox} ${styles.bgOrangeLight}`}>
                <Bell className={styles.textOrange} />
              </div>
            </div>
            <p className={`${styles.cardNumber} ${styles.textOrange}`}>
              {notifications}
            </p>
            <p className={styles.cardSubtitle}>Unread messages</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h2 className={styles.quickTitle}>Quick Actions</h2>
          <div className={styles.quickGrid}>
            <button className={`${styles.quickBtn} ${styles.bgBlueLight}`}>
              <Calendar className={`${styles.quickIcon} ${styles.textBlue}`} />
              <p className={styles.quickLabel}>New Booking</p>
            </button>
            <button className={`${styles.quickBtn} ${styles.bgGreenLight}`}>
              <Lock className={`${styles.quickIcon} ${styles.textGreen}`} />
              <p className={styles.quickLabel}>Security</p>
            </button>
            <button className={`${styles.quickBtn} ${styles.bgPurpleLight}`}>
              <User className={`${styles.quickIcon} ${styles.textPurple}`} />
              <p className={styles.quickLabel}>Profile</p>
            </button>
            <button className={`${styles.quickBtn} ${styles.bgOrangeLight}`}>
              <Bell className={`${styles.quickIcon} ${styles.textOrange}`} />
              <p className={styles.quickLabel}>Alerts</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
