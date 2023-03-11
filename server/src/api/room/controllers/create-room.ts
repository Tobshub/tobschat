import { io } from "@/.";
import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";
import appToken from "@/config/token";

export async function createRoom(userId: string, roomProps: { name: string; otherMember: string }) {
  try {
    const otherMember = await usePrisma.user.findUnique({
      where: { email: roomProps.otherMember },
      select: { id: true },
    });

    if (!otherMember) {
      return Err("Tried to create a room with a non-user");
    }
    if (otherMember.id === userId) {
      return Err("Cannot create a room with yourself");
    }

    const room = await usePrisma.room.create({
      data: {
        name: roomProps.name,
        members: { connect: [{ id: otherMember.id }, { id: userId }] },
      },
      select: { id: true },
    });

    // emit socket event to tell client to refetch
    io.to([otherMember.id, userId]).emit("room:new");

    // don't pass memberIds back to the user
    return Ok(room.id);
  } catch (err) {
    LOG.error(err, "Error: failed to create room");
    return Err("an error occured", err);
  }
}

