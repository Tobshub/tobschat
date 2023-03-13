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
    if (receivingUser.id === userId) {
      return Err("Cannot send friend request to yourself.");
    }

    const friendRequest = await usePrisma.friendRequest.create({
      data: {
        sender: { connect: { id: userId } },
        receiver: { connect: { id: receivingUser.id } },
      },
      select: {
        id: true,
        status: true,
        sender: { select: { publicId: true, username: true } },
        receiver: { select: { publicId: true, username: true } },
      },
    });

    // emit the new friendrequest in respective events
    io.to(receivingUser.id).emit("friend_request:new", friendRequest);
    io.to(userId).emit("friend_request:sent", friendRequest);

    return Ok("");
  } catch (error) {
    LOG.error(error, "Error: failed to send friend request");
    return Err("An error occured");
  }
}

