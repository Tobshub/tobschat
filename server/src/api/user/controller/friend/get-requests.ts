import LOG from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function getFriendRequests(id: string) {
  try {
    const user = await usePrisma.user.findUnique({
      where: { id: id },
      select: {
        sentFriendRequests: {
          select: { id: true, status: true, receiver: { select: { username: true, publicId: true } } },
        },
        receivedFriendRequests: {
          select: { id: true, status: true, sender: { select: { username: true, publicId: true } } },
        },
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

