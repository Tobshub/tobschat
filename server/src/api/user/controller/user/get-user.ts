import LOG from "@/config/log";
import { usePrisma } from "@/config/prisma";
import { Err, Ok } from "@/helpers/result";
import appToken from "@/config/token";

export async function getUserPublic(token: string) {
  try {
    const validate = appToken.validate(token);
    if (!validate.ok) {
      return validate;
    }
    const user = await usePrisma.user.findUnique({
      where: { id: validate.value.id },
      select: { username: true, publicId: true },
    });

    if (!user) {
      return Err("user not found");
    }

    return Ok(user);
  } catch (err) {
    LOG.error(err, "Error: failed to get username");
    return Err("an error occured");
  }
}

export async function getUserPrivate(token: string) {
  try {
    const validate = appToken.validate(token);
    if (!validate.ok) {
      return validate;
    }
    const user = await usePrisma.user.findUnique({
      where: { id: validate.value.id },
      select: {
        id: true,
        email: true,
        username: true,
        publicId: true,
        friendsWith: { select: { username: true, publicId: true } },
      },
    });

    if (!user || user.id !== validate.value.id) {
      return Err("user not found");
    }

    return Ok({ email: user.email, username: user.email, publicId: user.publicId, friends: user.friendsWith });
  } catch (err) {
    LOG.error(err, "Error: failed to get username");
    return Err("an error occured", err);
  }
}

