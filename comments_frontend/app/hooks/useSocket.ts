import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/au_context";

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token, logout } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const newSocket = io(url, {
      transports: ["websocket"],
      auth: { token },
      reconnection: false,
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      if (err.message === "Unauthorized" || err.message === "invalid token") {
        logout();
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [url, token, logout]);

  return socket;
};
