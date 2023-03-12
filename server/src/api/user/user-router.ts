import z from "zod";
import { newUser } from "./controller/user/new";
import { login } from "./controller/user/login";
import { getUserRooms } from "./controller/user/rooms";
import { getUserPrivate } from "./controller/user/get-user";
import { getFriendRequests } from "./controller/friend/get-requests";
import { sendFriendRequest } from "./controller/friend/send-request";
import { tRouter, tProcedure, tError, authedProcedure } from "../../config/trpc";
import { searchUser } from "./controller/user/search-users";

export const userRouter = tRouter({
  new: tProcedure
    .input(
      z.object({ email: z.string().email(), password: z.string().min(8).max(64), username: z.string().min(5).max(20) })
    )
    .mutation(async ({ input }) => {
      const res = await newUser(input);
      if (res.ok) {
        return res;
      }
      switch (res.message) {
        case "user already exists": {
          return res;
        }
        default: {
          throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
        }
      }
    }),
  login: tProcedure.input(z.object({ email: z.string().email(), password: z.string() })).mutation(async ({ input }) => {
    const res = await login(input);
    if (res.ok) {
      return res;
    }
    switch (res.message) {
      case "not found": {
        return res;
      }
      default: {
        throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
      }
    }
  }),
  userRooms: authedProcedure.query(async ({ ctx }) => {
    const res = await getUserRooms(ctx.id);

    if (res.ok) {
      return res;
    }
    // for all error cases, force the user to login again
    switch (res.message) {
      case "user not found": {
        throw new tError({ code: "NOT_FOUND", ...res });
      }
      default: {
        throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
      }
    }
  }),
  getUserPrivate: authedProcedure.query(async ({ ctx }) => {
    const res = await getUserPrivate(ctx.id);
    if (res.ok) {
      return res;
    }

    switch (res.message) {
      case "user not found": {
        throw new tError({ code: "NOT_FOUND", message: res.message });
      }
      default: {
        throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
      }
    }
  }),
  searchUser: tProcedure
    .input(z.object({ query: z.string(), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const res = await searchUser(input.query, input.cursor);

      if (res.ok) {
        return res;
      }

      throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
    }),
  friendRequest: friendRequestRouter(),
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
          throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
        }
      }
    }),
    send: authedProcedure
      .input(z.object({ receiver: z.object({ publicId: z.string() }) }))
      .mutation(async ({ ctx, input }) => {
        const res = await sendFriendRequest(ctx.id, input.receiver);

        if (res.ok) {
          return res;
        }

        switch (res.message) {
          case "User does not exist": {
            throw new tError({ code: "NOT_FOUND", message: res.message });
          }
          default: {
            throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
          }
        }
      }),
    // acceptFriendRequest:
    // declineFriendRequest:
  });
}

