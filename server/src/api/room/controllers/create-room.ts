import { io } from "@/.";
import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";
import appToken from "@/api/user/controller/token";

export async function createRoom(token: string, roomProps: { name: string; otherMember: string }) {
  try {
    const validate = appToken.validate(token);
    if (!validate.ok) {
      return validate;
    }

    const otherMember = await usePrisma.user.findUnique({
      where: { email: roomProps.otherMember },
      select: { id: true },
    });

    if (!otherMember) {
      return Err("Tried to create a room with a non-user");
    }
    if (otherMember.id === validate.value.id) {
      return Err("Cannot create a room with yourself");
    }

    const room = await usePrisma.room.create({
      data: {
        name: roomProps.name,
        members: { connect: [{ id: otherMember.id }, { id: validate.value.id }] },
      },
      select: { id: true },
    });

    // emit socket event to tell client to refetch
    io.to([otherMember.id, validate.value.id]).emit("room:new");

    // don't pass memberIds back to the user
    return Ok(room.id);
  } catch (err) {
    LOG.error(err, "Error: failed to create room");
    return Err("an error occured", err);
  }
}

