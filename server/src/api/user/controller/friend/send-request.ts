import { io } from "../../../..";
import Log from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function sendFriendRequest(userId: string, receiver: { publicId: string }) {
  try {
    const receivingUser = await usePrisma.user.findUnique({
      where: { publicId: receiver.publicId },
      select: {
        id: true,
        friendsOfIds: true,
        friendsWithIds: true,
        receivedFriendRequests: { select: { senderId: true } },
        sentFriendRequests: { select: { receiverId: true } },
      },
    });
    if (!receivingUser) {
      return Err("User does not exist");
    }
    if (receivingUser.id === userId) {
      return Err("Cannot send friend request to yourself.");
    }

    if (receivingUser.friendsOfIds.includes(userId) || receivingUser.friendsWithIds.includes(userId)) {
      return Err("You are already friends with this user.");
    }

    if (receivingUser.receivedFriendRequests.find((friendRequest) => friendRequest.senderId === userId)) {
      return Err("You have already sent a friend request to this user.");
    }

    if (receivingUser.sentFriendRequests.find((friendRequest) => friendRequest.receiverId === userId)) {
      return Err("User has already sent you a friend request.");
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
    Log.error(error, "Error: failed to send friend request");
    return Err("An error occured");
  }
}

