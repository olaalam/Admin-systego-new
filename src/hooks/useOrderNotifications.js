import { useEffect } from "react";
import { io } from "socket.io-client";

export function useOrderNotifications(onNewOrder) {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const socket = io(baseUrl, { transports: ["websocket"] });
    socket.on("new_order", (order) => {
      if (typeof onNewOrder === "function") onNewOrder(order);
    });
    return () => socket.disconnect();
  }, [onNewOrder]);
}