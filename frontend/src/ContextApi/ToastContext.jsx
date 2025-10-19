import React, { createContext, useContext, useState } from "react";
import Toast from "../comoponent/toaster/toast/toast.jsx";
import showToast from "../comoponent/toaster/showToast/showToast";

// 1️⃣ Create Context
const ToastContext = createContext();

// 2️⃣ Provider Component
export const ToastProvider = ({ children }) => {
  const [list, setList] = useState([]);

  // wrapper function for your toast logic
  const handleShowToast = (type, message) => {
    showToast(type, list, setList, message);
  };

  return (
    <ToastContext.Provider value={{ handleShowToast }}>
      {children}

      {/* Always-mounted toast system */}
      <Toast toastList={list} position="top-right" setList={setList} />
    </ToastContext.Provider>
  );
};

// 3️⃣ Hook for consuming the context
export const useToast = () => useContext(ToastContext);
