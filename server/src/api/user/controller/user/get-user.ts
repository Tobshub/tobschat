import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";

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
      },
    });

    if (!user || user.id !== id) {
      return Err("user not found");
    }

    return Ok({ email: user.email, username: user.email, publicId: user.publicId, friends: user.friendsWith });
  } catch (err) {
    LOG.error(err, "Error: failed to get username");
    return Err("an error occured", err);
  }
}

