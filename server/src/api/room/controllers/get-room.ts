import LOG from "../../../config/log";
import { usePrisma } from "../../../config/prisma";
import { Err, Ok } from "../../../helpers/result";
import appToken from "../../user/controller/token";

export async function getRoom(token: string, roomId: string) {
  try {
    const validate = appToken.validate(token);
    if (!validate.ok) {
      return validate;
    }
    const room = await usePrisma.room.findUnique({
      where: { id: roomId },
      select: {
        name: true,
        messages: {
          take: 50,
          orderBy: { createdAt: "asc" },
          select: { key: true, content: true, createdAt: true, sender: { select: { email: true } } },
        },
        members: { select: { username: true } },
        memberIds: true,
      },
    });

    if (!room) {
      return Err("room does not exist");
    }
    if (!room.memberIds.includes(validate.value.id)) {
      return Err("user is not a member of that room");
    }

    return Ok({ ...room, memberIds: undefined });
  } catch (err) {
    LOG.error(err, "Error: failed to fetch room");
    return Err("an error occured");
  }
}

