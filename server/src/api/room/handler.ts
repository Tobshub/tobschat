import { Server, Socket } from "socket.io";
import LOG from "../../config/log";

export default function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on("room:join", (roomId) => {
    // join a room's room to recieve all event broadcasted to it
    socket.join(roomId);
  });

  socket.on("room:message", (message: { roomId: string }) => {
    // broadcast new message to users in the room
    socket.broadcast.to(message.roomId).emit("room:message", message);
  });
}

