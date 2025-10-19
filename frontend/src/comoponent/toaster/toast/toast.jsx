import { useCallback, useEffect } from "react";

import styles from "./toast.module.css";
import ToasterSuccessTickIcon from "../../../assest/checkIcon.png";
import ToasterSuccessAlertIcon from "../../../assest/errorIcon.png";

const Toast = ({ toastList = [], position, setList }) => {
  
  const deleteToast = useCallback(
    (id) => {
      const toastListItem = toastList.filter((e) => e.id !== id);
      setList(toastListItem);
    },
    [toastList, setList]
  );


  useEffect(() => {
    const interval = setInterval(() => {
      if (toastList.length) {
        deleteToast(toastList[0].id);
      }
    }, 2500);
    return () => {
      clearInterval(interval);
    };
  }, [toastList, deleteToast]);

  return (
    <div
      className={`${styles.Toastcontainer} ${styles[position]}`}
      style={{ zIndex: toastList.length ? 0 : -100 }}
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