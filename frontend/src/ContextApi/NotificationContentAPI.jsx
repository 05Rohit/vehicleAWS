import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Notification_Server_API } from "../APIPoints/AllApiPonts";

const SocketContext = createContext();

const SOCKET_URL = Notification_Server_API; 


export const SocketProvider = ({ userData, children }) => {

  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // connect socket
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], // ensures fast connection
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // when connected, register user/admin
    newSocket.on("connect", () => {
      // console.log("✅ Connected to Socket.IO server");
console.log("user",userData?.userType)
      if (userData?.userType === "admin") {
        // console.log("User Admin:", userData);
        newSocket.emit("register_admin");
      } else if (userData?.id) {
        newSocket.emit("register_user", userData.id);
      }
    });

    // listen for notifications
    newSocket.on("new_notification", (data) => {
      console.log("🔔 New notification:", data);
      setNotifications((prev) => [data, ...prev]);
    });

    // handle disconnect
    newSocket.on("disconnect", () => {
      // console.warn("⚠️ Disconnected from Socket.IO server");
    });

    // cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userData]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
