import z from "zod";
import {
  tRouter,
  tProcedure,
  tError,
  authedProcedure,
} from "../../config/trpc";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  sendFriendRequest,
} from "./controller/friend";
import {
  newUser,
  login,
  getUserRooms,
  getUserPrivate,
  searchUser,
  getUserPublic,
  editUsername,
  editUserBio,
} from "./controller/user";
import Log from "../../config/log";

export const userRouter = tRouter({
  new: tProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(64),
        username: z.string().min(5).max(20),
      })
    )
    .mutation(async ({ input }) => {
      // replace spaces with underscores
      const username = input.username.split(" ").join("_");
      const res = await newUser({ ...input, username });
      if (res.ok) {
        Log.info("Sign up success");
        return res;
      }
      switch (res.message) {
        case "user already exists": {
          return res;
        }
        default: {
          throw new tError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.message,
          });
        }
      }
    }),
  login: tProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const res = await login(input);
      if (res.ok) {
        Log.info("Login Success");
        return res;
      }
      switch (res.message) {
        case "not found": {
          return res;
        }
        default: {
          throw new tError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.message,
          });
        }
      }
    }),
  userRooms: authedProcedure.query(async ({ ctx }) => {
    const res = await getUserRooms(ctx.id);

    if (res.ok) {
      Log.info(["Success Loaded Rooms", ctx.id]);
      return res;
    }
    // for all error cases, force the user to login again
    switch (res.message) {
      case "user not found": {
        throw new tError({ code: "NOT_FOUND", ...res });
      }
      default: {
        throw new tError({
          code: "INTERNAL_SERVER_ERROR",
          message: res.message,
        });
      }
    }
  }),
  getUserPrivate: authedProcedure.query(async ({ ctx }) => {
    const res = await getUserPrivate(ctx.id);
    if (res.ok) {
      Log.info(["Success Getting User's Private Data", ctx.id]);
      return res;
    }

    switch (res.message) {
      case "user not found": {
        throw new tError({ code: "NOT_FOUND", message: res.message });
      }
      default: {
        throw new tError({
          code: "INTERNAL_SERVER_ERROR",
          message: res.message,
        });
      }
    }
  }),
  getUserPublic: tProcedure
    .input(z.object({ publicId: z.string() }))
    .query(async ({ input }) => {
      const res = await getUserPublic(input.publicId);

      if (res.ok) {
        return res;
      }

      switch (res.message) {
        case "User not found": {
          throw new tError({ code: "NOT_FOUND", message: res.message });
        }
        default: {
          throw new tError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.message,
          });
        }
      }
    }),
  searchUser: tProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const res = await searchUser(input.username);

      if (res.ok) {
        return res;
      }

      switch (res.message) {
        case "User not found": {
          return res;
        }
        default: {
          throw new tError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.message,
          });
        }
      }
    }),
  friendRequest: friendRequestRouter(),
  editUsername: authedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const res = await editUsername(ctx.id, input.username);

      if (res.ok) {
        return res;
      }

      switch (res.message) {
        case "Username is already taken.":
        case "You already have that username.": {
          return res;
        }
        default: {
          throw new tError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.message,
          });
        }
      }
    }),
  editUserBio: authedProcedure
    .input(z.object({ bio: z.string().max(200) }))
    .mutation(async ({ ctx, input }) => {
      const res = await editUserBio(ctx.id, input.bio);

      if (res.ok) {
        return res;
      }

      switch (res.message) {
        case "User not found.": {
          throw new tError({ code: "NOT_FOUND", message: res.message });
        }
        default: {
          throw new tError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.message,
          });
        }
      }
    }),
});

function friendRequestRouter() {
  return tRouter({
    get: authedProcedure.query(async ({ ctx }) => {
      const res = await getFriendRequests(ctx.id);

      if (res.ok) {
        return res;
      }

      switch (res.message) {
        case "user not found": {
          throw new tError({ code: "NOT_FOUND", message: res.message });
        }
        default: {
          throw new tError({
            code: "INTERNAL_SERVER_ERROR",
            message: res.message,
          });
        }
      }
    }),
    send: authedProcedure
      .input(z.object({ receiver: z.object({ publicId: z.string() }) }))
      .mutation(async ({ ctx, input }) => {
        const res = await sendFriendRequest(ctx.id, input.receiver);

        if (res.ok) {
          Log.info(["Sent friend Request"]);
          return res;
        }

        switch (res.message) {
          case "User does not exist": {
            throw new tError({ code: "NOT_FOUND", message: res.message });
          }
          case "Cannot send friend request to yourself.":
          case "User has already sent you a friend request.":
          case "You are already friends with this user.":
          case "You have already sent a friend request to this user.": {
            throw new tError({ code: "FORBIDDEN", message: res.message });
          }
          default: {
            throw new tError({
              code: "INTERNAL_SERVER_ERROR",
              message: res.message,
            });
          }
        }
      }),
    acceptFriendRequest: authedProcedure
      .input(z.object({ requestId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const res = await acceptFriendRequest(ctx.id, input.requestId);

        if (res.ok) {
          return res;
        }

        switch (res.message) {
          case "User hasn't sent you a friend request!": {
            return res;
          }
          default: {
            throw new tError({
              code: "INTERNAL_SERVER_ERROR",
              message: res.message,
            });
          }
        }
      }),
    declineFriendRequest: authedProcedure
      .input(z.object({ requestId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const res = await declineFriendRequest(ctx.id, input.requestId);

        if (res.ok) {
          return res;
        }

        switch (res.message) {
          case "User hasn't sent you a friend request!": {
            return res;
          }
          default: {
            throw new tError({
              code: "INTERNAL_SERVER_ERROR",
              message: res.message,
            });
          }
        }
      }),
    cancelFriendRequest: authedProcedure
      .input(z.object({ requestId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const res = await cancelFriendRequest(ctx.id, input.requestId);
        if (res.ok) {
          Log.info(["Cancelled Friend Request", input.requestId]);
          return res;
        }

        switch (res.message) {
          case "Friend Request Not Found":
          case "Friend request has already been responded too": {
            return res;
          }
          default: {
            throw new tError({
              code: "INTERNAL_SERVER_ERROR",
              message: res.message,
            });
          }
        }
      }),
  });
}
