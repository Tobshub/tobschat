import { Server, Socket } from "socket.io";
import appToken from "./controller/token";

export default function registerUserHandlers(io: Server, socket: Socket) {
  socket.on("user:load", async (token: string) => {
    const user = appToken.validate(token);
    if (user.ok) {
      // join a room under the user's perm id
      await socket.join(user.value.id);
      // leave the remove when the user emits user:logout
      socket.on("user:logout", async () => {
        await socket.leave(user.value.id);
      });
    }
  });
}

