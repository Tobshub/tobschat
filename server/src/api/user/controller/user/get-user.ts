import Log from "../../../../config/log";
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
        friendsWith: {
          select: { username: true, publicId: true, online: true },
        },
        friendsOf: { select: { username: true, publicId: true, online: true } },
        receivedFriendRequests: {
          select: {
            id: true,
            status: true,
            sender: { select: { publicId: true, username: true } },
          },
        },
      },
    });

    if (!user) {
      Log.error(["User Not Found", id]);
      return Err("user not found");
    }

    return Ok({
      email: user.email,
      username: user.username,
      publicId: user.publicId,
      friends: user.friendsWith.concat(user.friendsOf),
    });
  } catch (err) {
    Log.error(err, "Error: failed to get private profile");
    return Err("an error occured", err);
  }
}

export async function getUserPublic(publicId: string) {
  try {
    const user = await usePrisma.user.findUnique({
      where: { publicId },
      select: {
        username: true,
        publicId: true,
        bio: true,
      },
    });
    if (!user) {
      return Err("User not found");
    }

    return Ok(user);
  } catch (error) {
    Log.error(error, "Error: failed to get public user profile");
    return Err("An error occured", error);
  }
}
