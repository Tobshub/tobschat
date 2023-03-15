import Log from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function getUserRooms(id: string) {
  try {
    const user = await usePrisma.user.findUnique({
      where: { id: id },
      select: {
        rooms: {
          select: {
            blob: true,
            name: true,
            type: true,
            members: { select: { username: true, publicId: true }, take: 5 },
          },
        },
      },
    });

    if (!user) {
      Log.error("User not found");
      return Err("user not found");
    }

    return Ok(user.rooms);
  } catch (err) {
    Log.error(err, "Error: failed to get user's rooms");
    return Err("an error occured");
  }
}

