import { io } from "socket.io-client";

// Get URL and remove any accidental trailing slashes
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
