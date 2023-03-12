import LOG from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function searchUser(query: string, cursor?: string) {
  try {
    const foundUsers = await usePrisma.user.findMany({
      orderBy: { username: "asc" },
      where: { username: { contains: query } },
      select: { publicId: true, username: true },
      take: 20,
      cursor: cursor ? { publicId: cursor } : undefined,
    });

    return Ok(foundUsers);
  } catch (error) {
    LOG.error(error, "Error: failed to search for users");
    return Err("An error occured");
  }
}

