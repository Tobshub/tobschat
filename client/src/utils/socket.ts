import { server_url } from "@data/api";
import { io } from "socket.io-client";

/**
 * App socket.io instance
 *
 * Interacts with the server's socket.io client
 *
 * All *emitters* and *listeners* are set on this
 */
export const socket = io(server_url, { reconnectionDelay: 5000, autoConnect: false, reconnection: true });

