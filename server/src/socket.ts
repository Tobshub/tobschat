import { Server } from "socket.io";
import LOG from "./config/log";
import registerUserHandlers from "./api/user/handler";
import registerRoomHandlers from "./api/room/handler";

const rooms: { room_id: string; name: string }[] = [];

// FIXIT: wrap message type
// export interface ClientToServerEvents {
//   "new room": (room: { id: string; name: string }) => void;
// }

export default function socketHandler(io: Server) {
  io.on("connection", (socket) => {
    LOG("info", "Established Socket Connection", socket.id);

    registerUserHandlers(io, socket);
    registerRoomHandlers(io, socket);
  });
}

