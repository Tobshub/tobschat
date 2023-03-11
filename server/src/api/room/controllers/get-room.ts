import LOG from "../../../config/log";
import { usePrisma } from "../../../config/prisma";
import { Err, Ok } from "../../../helpers/result";

export async function getRoom(userId: string, roomBlob: string, cursor?: number) {
  try {
    const room = await usePrisma.room.findUnique({
      where: { blob: roomBlob },
      select: {
        name: true,
        messages: { select: { content: true, senderPublicId: true, key: true, createdAt: true } },
        members: { select: { username: true, publicId: true } },
        memberIds: true,
      },
    });

    if (!room) {
      return Err("room does not exist");
    }
    if (!room.memberIds.includes(userId)) {
      return Err("user is not a member of that room");
    }

    return Ok({
      name: room.name,
      // send a most 50 messages to the client at once
      messages: cursor && cursor > 0 ? room.messages.slice(cursor, cursor + 50) : room.messages.slice(0, 50),
      members: room.members,
    });
  } catch (err) {
    LOG.error(err, "Error: failed to fetch room");
    return Err("an error occured");
  }
}

