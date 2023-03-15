import { io } from "../../..";
import LOG from "../../../config/log";
import { usePrisma } from "../../../config/prisma";
import { Err, Ok } from "../../../helpers/result";

export async function createPrivateRoom(userId: string, roomProps: { otherMember: string }) {
  try {
    const otherMember = await usePrisma.user.findUnique({
      where: { publicId: roomProps.otherMember },
      select: { id: true },
    });

    if (!otherMember) {
      return Err("Tried to create a room with a non-user");
    }
    if (otherMember.id === userId) {
      return Err("Cannot create a room with yourself");
    }

    // check if a private room exists between the two users
    const existingPrivateRoom = await usePrisma.room.findMany({
      where: { memberIds: { hasEvery: [userId, otherMember.id] } },
      select: { blob: true },
    });

    if (existingPrivateRoom.length) {
      return Err("Room already exists with that user", existingPrivateRoom);
    }

    const room = await usePrisma.room.create({
      data: {
        name: "Private Room",
        members: { connect: [{ id: otherMember.id }, { id: userId }] },
      },
      // private rooms will be listed with the other user's username as the name of the room
      select: { blob: true, type: true, members: { select: { username: true, publicId: true } } },
    });

    // emit socket event with new room data
    io.to([otherMember.id, userId]).emit("room:new", room);

    return Ok(room);
  } catch (err) {
    LOG.error(err, "Error: failed to create room");
    return Err("an error occured", err);
  }
}

