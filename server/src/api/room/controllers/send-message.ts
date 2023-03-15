import Log from "../../../config/log";
import { usePrisma } from "../../../config/prisma";
import { Ok, Err } from "../../../helpers/result";

export async function sendMessage(messageProps: {
  senderPublicId: string;
  content: string;
  key: string;
  roomBlob: string;
}) {
  try {
    await usePrisma.room.update({
      where: { blob: messageProps.roomBlob },
      data: {
        messages: {
          push: { content: messageProps.content, key: messageProps.key, senderPublicId: messageProps.senderPublicId },
        },
      },
    });

    return Ok({});
  } catch (err) {
    Log.error(err, "Error: failed to send Message");
    return Err("an error occured");
  }
}

