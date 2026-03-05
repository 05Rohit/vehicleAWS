import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import NavBarStyle from "./NavBar.module.css";

const ProfileDropdown = ({
  loading,
  user,
  isOpen,
  setIsOpen,
  profileRef,
  menuItems,
  handleNavigate,
}) => {
  /* ================= Click Outside + ESC ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, profileRef, setIsOpen]);

  return (
    <div
      className={NavBarStyle.navbarpage_Content_Profile_Box}
      ref={profileRef}
    >
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {!user?.email ? (
            <div className={NavBarStyle.navbarpage_Content_Boxes}>
              <button
                onClick={() => handleNavigate("/login")}
                className={NavBarStyle.LoginButton}
              >
                LogIn
              </button>
            </div>
          ) : (
            <div className={NavBarStyle.dropdownWrapper}>
              <button
                onClick={() => setIsOpen((prev) => !prev)}
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
                <div className={NavBarStyle.dropdownMenu}>
                  {/* Header */}
                  <div className={NavBarStyle.dropdownHeader}>
                    <p className={NavBarStyle.welcomeText}>Welcome :</p>
                    <p className={NavBarStyle.welcomeName}>{user?.name}</p>
                  </div>

                  {/* Menu */}
                  <div className={NavBarStyle.menuList}>
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setIsOpen(false); // ✅ close after click
                        }}
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

                  <div className={NavBarStyle.dropdownBottom} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;
