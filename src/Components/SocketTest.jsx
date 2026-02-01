import { useEffect } from "react";
import socket from "../../socket";

export default function SocketTest() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected frontend:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  return <h2>Socket Test</h2>;
}
