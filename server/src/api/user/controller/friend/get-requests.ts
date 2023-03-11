import LOG from "@/config/log";
import { Err, Ok } from "@/helpers/result";
import appToken from "../token";
import { usePrisma } from "@/config/prisma";

export async function getFriendRequests(token: string) {
  try {
    const validate = appToken.validate(token);

    if (!validate.ok) {
      return validate;
    }

    const user = await usePrisma.user.findUnique({
      where: { id: validate.value.id },
      select: {
        sentFriendRequests: { select: { id: true, receiver: { select: { username: true, publicId: true } } } },
        receivedFriendRequests: { select: { id: true, sender: { select: { username: true, publicId: true } } } },
      },
    });

    if (!user) {
      return Err("user not found");
    }

    return Ok(user);
  } catch (err) {
    LOG.error(err, "Error: could not get friend requests");
    return Err("an error occured", err);
  }
}

