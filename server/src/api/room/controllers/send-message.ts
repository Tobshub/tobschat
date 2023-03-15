import LOG from "../../../config/log";
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
      data: { messages: { push: { ...messageProps } } },
    });

    return Ok({});
  } catch (err) {
    LOG.error(err, "Error: failed to send Message");
    return Err("an error occured");
  }
}

