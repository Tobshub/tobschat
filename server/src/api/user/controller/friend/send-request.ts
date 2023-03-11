import { io } from "../../../..";
import LOG from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function sendFriendRequest(userId: string, receiver: { publicId: string }) {
  try {
    const receivingUser = await usePrisma.user.findUnique({
      where: { publicId: receiver.publicId },
      select: { id: true },
    });
    if (!receivingUser) {
      return Err("User does not exist");
    }

    const friendRequest = await usePrisma.friendRequest.create({
      data: {
        sender: { connect: { id: userId } },
        receiver: { connect: { id: receivingUser.id } },
      },
      select: { id: true, status: true, sender: { select: { publicId: true, username: true } } },
    });

    io.to(receivingUser.id).emit("noti:friend_req", friendRequest);

    return Ok("");
  } catch (error) {
    LOG.error(error, "Error: failed to send friend request");
    return Err("An error occured");
  }
}

