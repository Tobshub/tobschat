import { io } from "../../../..";
import Log from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function acceptFriendRequest(userId: string, requestId: string) {
  try {
    const friendRequest = await usePrisma.user
      .update({
        where: { id: userId },
        data: { receivedFriendRequests: { update: { where: { id: requestId }, data: { status: "ACCEPTED" } } } },
        select: { receivedFriendRequests: { where: { id: requestId }, select: { senderId: true } } },
      })
      // error thrown when receivedFriendRequests is not found
      .catch((_) => null);

    if (!friendRequest) {
      return Err("User hasn't sent you a friend request!");
    }

    await usePrisma.user.update({
      where: { id: userId },
      data: { friendsWith: { connect: { id: friendRequest.receivedFriendRequests[0].senderId } } },
    });

    // emit event with request id to let sender know request has been accepted
    io.to(friendRequest.receivedFriendRequests[0].senderId).emit("friend_request:accepted", requestId);

    return Ok({});
  } catch (err) {
    Log.error(err, "Error: Failed to accept request");
    return Err("An error occured");
  }
}

