import { io } from "../../../..";
import LOG from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function declineFriendRequest(userId: string, requestId: string) {
  try {
    const friendRequest = await usePrisma.user
      .update({
        where: { id: userId },
        data: { receivedFriendRequests: { update: { where: { id: requestId }, data: { status: "DECLINED" } } } },
        select: { receivedFriendRequests: { where: { id: requestId }, select: { senderId: true } } },
      })
      // error thrown when receivedFriendRequest is not found
      .catch((_) => null);

    if (!friendRequest) {
      return Err("User hasn't sent you a friend request!");
    }

    // emit event with request id to let sender know request has been declined
    io.to(friendRequest.receivedFriendRequests[0].senderId).emit("friend_request:declined", requestId);

    return Ok({});
  } catch (error) {
    LOG.error(error, "Error: Failed to decline friend request");
    return Err("An error occured.");
  }
}

