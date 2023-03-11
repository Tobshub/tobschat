import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";
import appToken from "@/config/token";

export async function sendMessage(token: string, messageProps: { content: string; key: string; roomId: string }) {
  try {
    const validate = appToken.validate(token);
    if (!validate.ok) {
      return validate;
    }

    let l = await usePrisma.room.update({
      where: { id: messageProps.roomId },
      data: {
        messages: {
          create: {
            content: messageProps.content,
            key: messageProps.key,
            sender: { connect: { id: validate.value.id } },
          },
        },
      },
    });

    return Ok({});
  } catch (err) {
    LOG.error(err, "Error: failed to send Message");
    return Err("an error occured");
  }
}

