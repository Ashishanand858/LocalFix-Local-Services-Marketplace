import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return undefined;
    }

    const userId = user.id || user._id;

    if (!userId) {
      setSocket(null);
      return undefined;
    }

    const instance = io(SOCKET_URL, {
      transports: import.meta.env.DEV ? ["polling"] : ["polling", "websocket"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const handleConnect = () => {
      instance.emit("join_user", userId);
    };

    const handleNotification = (notification) => {
      if (!notification) return;

      setNotifications((items) => [notification, ...items]);

      if (notification.message) {
        toast(notification.message);
      }
    };

    instance.on("connect", handleConnect);
    instance.on("new_notification", handleNotification);

    setSocket(instance);

    return () => {
      instance.off("connect", handleConnect);
      instance.off("new_notification", handleNotification);
      instance.disconnect();
      setSocket(null);
    };
  }, [user]);

  const value = useMemo(
    () => ({
      socket,
      notifications,
      setNotifications,
    }),
    [socket, notifications],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
