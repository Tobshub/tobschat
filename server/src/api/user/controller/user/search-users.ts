import Log from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function searchUser(username: string) {
  try {
    const user = await usePrisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { username: true, publicId: true },
    });

    if (!user) {
      return Err("User not found");
    }

    return Ok(user);
  } catch (error) {
    Log.error(error, "Error: failed to search for users");
    return Err("An error occured");
  }
}
