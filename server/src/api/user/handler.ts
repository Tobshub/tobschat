import { Server, Socket } from "socket.io";
import appToken from "../../config/token";
import { usePrisma } from "../../config/prisma";
import Log from "../../config/log";

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

  // attach online status listeners
  socket.on("user:status", async (token: string, online: boolean) => {
    const user = appToken.validate(token);
    if (user.ok) {
      Log.info(`User online status changed: ${online}`, `user: ${user.value.id}`)
      const foundUser = await usePrisma.user.update({
        where: { id: user.value.id },
        data: { online },
        select: {friendsOfIds: true, friendsWithIds: true, publicId: true}
      });
      const friends = foundUser.friendsOfIds.concat(foundUser.friendsWithIds);
      for (let friend of friends) {
        io.to(friend).emit("friend:status", foundUser.publicId, online);
      }
    }
  });
}
