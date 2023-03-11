import { z } from "zod";
import { authedProcedure, tError, tProcedure, tRouter } from "@/config/trpc";
import { createRoom } from "./controllers/create-room";
import { getRoom } from "./controllers/get-room";
import { sendMessage } from "./controllers/send-message";

export const roomRouter = tRouter({
  createRoom: authedProcedure
    .input(z.object({ name: z.string().min(3).max(20), otherMember: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const res = await createRoom(ctx.id, input);

      if (res.ok) {
        return res;
      } else {
        switch (res.message) {
          case "Tried to create a room with a non-user":
          case "Cannot create a room with yourself": {
            return res;
          }
          default: {
            throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
          }
        }
      }
    }),
  getRoom: authedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const res = await getRoom(ctx.id, input);

    if (res.ok) {
      return res;
    } else {
      switch (res.message) {
        case "user is not a member of that room":
        case "room does not exist": {
          throw new tError({ code: "NOT_FOUND" });
        }
        default: {
          throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
        }
      }
    }
  }),
  sendMessage: authedProcedure
    .input(z.object({ content: z.string().min(1), roomId: z.string(), key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const res = await sendMessage(ctx.id, input);

      if (res.ok) {
        return res;
      }

      throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
    }),
});

