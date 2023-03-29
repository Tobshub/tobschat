import Log from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function editUsername(userId: string, newUsername: string) {
  try {
    const check = await usePrisma.user.findUnique({
      where: { username: newUsername },
      select: { id: true },
    });

    if (check) {
      if (check.id === userId) {
        return Err("You already have that username.");
      }
      return Err("Username is already taken.");
    }

    await usePrisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
      select: null,
    });

    return Ok(newUsername);
  } catch (error) {
    Log.error(error, "Error: failed to edit user");
    return Err("an error occured");
  }
}

export async function editUserBio(userId: string, newBio: string) {
  try {
    const user = await usePrisma.user.update({
      where: { id: userId },
      data: { bio: newBio.length ? newBio : "Happy Chatter" },
      select: { id: true },
    });

    if (!user) {
      return Err("User not found.");
    }

    return Ok({});
  } catch (err) {
    Log.error(err, "Error: failed to edit user bio");
    return Err("an error occured");
  }
}
