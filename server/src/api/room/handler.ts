import { Server, Socket } from "socket.io";

export default function registerRoomHandlers(io: Server, socket: Socket) {
  // join a room's room to recieve all event broadcasted to it
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
  });

  socket.on("room:message", (message: { roomId: string }) => {
    // broadcast new message to users in the room
    socket.broadcast.to(message.roomId).emit("room:message", message);
  });

  // stop listening to events in a room
  socket.on("room:leave", (roomId) => {
    socket.leave(roomId);
  });
}

