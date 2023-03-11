import { Server } from "socket.io";
import registerUserHandlers from "./api/user/handler";
import registerRoomHandlers from "./api/room/handler";

export default function socketHandler(io: Server) {
  io.on("connection", (socket) => {
    registerUserHandlers(io, socket);
    registerRoomHandlers(io, socket);
  });
}

