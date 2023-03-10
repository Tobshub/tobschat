import LOG from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function getUserPrivate(id: string) {
  try {
    const user = await usePrisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        publicId: true,
        friendsWith: { select: { username: true, publicId: true } },
        friendsOf: { select: { username: true, publicId: true } },
        receivedFriendRequests: {
          select: { id: true, status: true, sender: { select: { publicId: true, username: true } } },
        },
      },
    });

    if (!user || user.id !== id) {
      return Err("user not found");
    }

    return Ok({
      email: user.email,
      username: user.email,
      publicId: user.publicId,
      friends: user.friendsWith.concat(user.friendsOf),
    });
  } catch (err) {
    LOG.error(err, "Error: failed to get username");
    return Err("an error occured", err);
  }
}

