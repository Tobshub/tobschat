import { z } from "zod";
import { tError, tProcedure, tRouter } from "../../config/trpc";
import { createRoom } from "./controllers/create-room";
import { getRoom } from "./controllers/get-room";

export const roomRouter = tRouter({
  createRoom: tProcedure
    .input(z.object({ name: z.string().min(3).max(20), otherMember: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth) throw new tError({ code: "BAD_REQUEST", message: "user token is missing" });

      const res = await createRoom(ctx.auth, input);

      if (res.ok) {
        return res;
      } else {
        switch (res.message) {
          case "failed to validate token": {
            throw new tError({ code: "UNAUTHORIZED", message: res.message });
          }
          case "Tried to create a room with a non-user":
          case "Cannot create a room with yourself": {
            return res;
          }
          case "an error occured": {
            throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
          }
        }
      }
    }),
  getRoom: tProcedure.input(z.string()).query(async ({ ctx, input }) => {
    if (!ctx.auth) throw new tError({ code: "BAD_REQUEST", message: "user token is missing" });
    const res = await getRoom(ctx.auth, input);

    if (res.ok) {
      return res;
    } else {
      switch (res.message) {
        case "an error occured": {
          throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
        }
        case "user is not a member of that room":
        case "room does not exist": {
          throw new tError({ code: "NOT_FOUND" });
        }
        case "failed to validate token": {
          throw new tError({ code: "UNAUTHORIZED", message: res.message });
        }
      }
    }
  }),
});

