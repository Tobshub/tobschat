import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";
import appToken from "@/config/token";

export async function getRoom(userId: string, roomId: string) {
  try {
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
    if (!room.memberIds.includes(userId)) {
      return Err("user is not a member of that room");
    }

    return Ok({ name: room.name, messages: room.messages, members: room.members });
  } catch (err) {
    LOG.error(err, "Error: failed to fetch room");
    return Err("an error occured");
  }
}

