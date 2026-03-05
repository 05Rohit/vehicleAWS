import { useEffect } from "react";

import styles from "./toast.module.css";
import ToasterSuccessTickIcon from "../../../assest/checkIcon.png";
import ToasterSuccessAlertIcon from "../../../assest/errorIcon.png";

const Toast = ({ toastList = [], position, setList }) => {
  const deleteToast = (id) => {
    setList((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Auto remove toast (cleanup included)
  useEffect(() => {
    if (!toastList.length) return;

    const timer = setTimeout(() => {
      deleteToast(toastList[0].id);
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastList]);

  return (
    <div
      className={`${styles.Toastcontainer} ${styles[position]}`}
      // style={{ zIndex: toastList.length ? 0 : -100 }}
      style={{ zIndex: toastList.length ? 9999 : -1 }}
    >
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.notification} ${styles.toast} ${styles[position]}`}
          style={{
            height: "max-content",
            opacity: 100,
          }}
        >
          <button onClick={() => deleteToast(toast.id)}>×</button>
          <div>
            <div className={styles.toastContent}>
              <div className={styles.title}>
                {toast.type === "danger" ? (
                  <img
                    className={styles.imageContent}
                    src={ToasterSuccessAlertIcon}
                    alt="error"
                  />
                ) : (
                  <img
                    className={styles.imageContent}
                    src={ToasterSuccessTickIcon}
                    alt="success"
                  />
                )}
              </div>
              <p className={styles.description}>{toast.description}</p>
            </div>
            <div
              className={styles.ToastBottom}
              style={{
                backgroundColor: toast.backgroundColor,
                height: "max-content",
                opacity: 100,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
