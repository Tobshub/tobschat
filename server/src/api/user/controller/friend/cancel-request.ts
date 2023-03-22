import Log from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import { Err, Ok } from "../../../../helpers/result";

export async function cancelFriendRequest(userId: string, requestId: string) {
  try {
    const friendRequest = await usePrisma.friendRequest.findFirst({
      where: { senderId: userId, id: requestId },
      select: { status: true, id: true },
    });

    if (!friendRequest) {
      return Err("Friend Request Not Found");
    }

    // return Err if the request has been accepted or declined already
    if (friendRequest.status !== "WAITING") {
      return Err("Friend request has already been responded too");
    }

    const deletedFriendRequest = await usePrisma.friendRequest.delete({
      where: { id: friendRequest.id },
      select: { sender: { select: { username: true, publicId: true } } },
    });

    return Ok(deletedFriendRequest);
  } catch (error) {
    Log.error(error, "Error: failed to cancel friend request");
    return Err("an error occured");
  }
}
