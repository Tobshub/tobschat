import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";
import appToken from "@/config/token";

export async function getUserRooms(token: string) {
  try {
    const validate = appToken.validate(token);
    if (!validate.ok) {
      return validate;
    }

    const user = await usePrisma.user.findUnique({
      where: { id: validate.value.id },
      select: { rooms: { select: { id: true, name: true } } },
    });

    if (!user) {
      return Err("user not found");
    }

    return Ok(user.rooms);
  } catch (err) {
    LOG.error(err, "Error: failed to get user's rooms");
    return Err("an error occured");
  }
}

