import { server_url } from "@data/api";
import { io } from "socket.io-client";
import { getToken } from "./token";

/**
 * App socket.io instance
 *
 * Interacts with the server's socket.io client
 *
 * All *emitters* and *listeners* are set on this
 */
export const socket = io(server_url, { reconnectionDelay: 5000, autoConnect: false, reconnection: true });
const token = getToken();
// listeners that need to be registered almost immediately
socket.on("connect", () => {
  // emit true online status on connection
  socket.emit("user:status", token, true);
})
socket.on("disconnect", () => {
    socket.emit("user:status", token, false);
})
