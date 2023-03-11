import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";
import appToken from "@/config/token";

export async function sendMessage(senderId: string, messageProps: { content: string; key: string; roomId: string }) {
  try {
    await usePrisma.room.update({
      where: { id: messageProps.roomId },
      data: { messages: { push: { senderId, ...messageProps } } },
    });

    return Ok({});
  } catch (err) {
    LOG.error(err, "Error: failed to send Message");
    return Err("an error occured");
  }
}

