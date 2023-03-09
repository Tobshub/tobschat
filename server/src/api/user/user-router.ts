import { tError, tProcedure, tRouter } from "../../config/trpc";
import z from "zod";
import { newUser } from "./controller/new";
import { login } from "./controller/login";
import { getUserRooms } from "./controller/rooms";
import { getUser } from "./controller/user-email";

export const userRouter = tRouter({
  new: tProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8).max(64), username: z.string() }))
    .mutation(async ({ input }) => {
      const res = await newUser(input);
      if (res.ok) {
        return res;
      }
      switch (res.message) {
        case "user already exists": {
          return res;
        }
        case "an error occured":
        case "failed to generate token": {
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
      case "an error occured":
      case "failed to generate token": {
        throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
      }
    }
  }),
  userRooms: tProcedure.query(async ({ ctx }) => {
    if (!ctx.auth) {
      throw new tError({ code: "BAD_REQUEST", message: "user token is missing" });
    }
    const res = await getUserRooms(ctx.auth);

    if (res.ok) {
      return res;
    }
    // for all error cases, force the user to login again
    switch (res.message) {
      case "an error occured": {
        throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
      }
      case "failed to validate token": {
        throw new tError({ code: "UNAUTHORIZED", message: res.message });
      }
      case "user not found": {
        throw new tError({ code: "NOT_FOUND", ...res });
      }
    }
  }),
  getUser: tProcedure.query(async ({ ctx }) => {
    if (!ctx.auth) {
      throw new tError({ code: "BAD_REQUEST", message: "user token is missing" });
    }

    const res = await getUser(ctx.auth);
    if (res.ok) {
      return res;
    }

    switch (res.message) {
      case "failed to validate token": {
        throw new tError({ code: "UNAUTHORIZED", message: res.message });
      }
      case "user not found": {
        throw new tError({ code: "NOT_FOUND", message: res.message });
      }
      default: {
        throw new tError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }
  }),
});

