import { io } from "socket.io-client";

export const socket = io("http://localhost:8008", {
  reconnectionDelay: 5000,
  autoConnect: false,
});

