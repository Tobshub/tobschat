import { server_url } from "data/api";
import { io } from "socket.io-client";

export const socket = io(server_url, { reconnectionDelay: 5000, autoConnect: false, reconnection: true });

