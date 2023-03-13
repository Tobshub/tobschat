import { io } from "../../../..";
import LOG from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function acceptFriendRequest(userId: string, requestId: string) {
  try {
    const friendRequest = await usePrisma.user
      .update({
        where: { id: userId },
        data: { sentFriendRequests: { update: { where: { id: requestId }, data: { status: "ACCEPTED" } } } },
        select: { sentFriendRequests: { where: { id: requestId }, select: { senderId: true } } },
      })
      // error thrown when sentFriendRequests is not found
      .catch((_) => null);

    if (!friendRequest) {
      return Err("User hasn't sent you a friend request!");
    }

    // emit event with request id to let sender know request has been accepted
    io.to(friendRequest.sentFriendRequests[0].senderId).emit("friend_request:accepted", requestId);

    return Ok({});
  } catch (err) {
    LOG.error(err, "Error: Failed to accept request");
    return Err("An error occured");
  }
}

