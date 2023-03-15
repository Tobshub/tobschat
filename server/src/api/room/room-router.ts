import { z } from "zod";
import { createPrivateRoom } from "./controllers/create-room";
import { getRoom } from "./controllers/get-room";
import { sendMessage } from "./controllers/send-message";
import { tRouter, authedProcedure, tError } from "../../config/trpc";

export const roomRouter = tRouter({
  createPrivateRoom: authedProcedure
    .input(z.object({ otherMember: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const res = await createPrivateRoom(ctx.id, input);

      if (res.ok) {
        return res;
      }
      switch (res.message) {
        case "Tried to create a room with a non-user":
        case "Cannot create a room with yourself":
        case "Room already exists with that user": {
          return res;
        }
        default: {
          throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
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
    .input(z.object({ senderPublicId: z.string(), content: z.string().min(1), roomId: z.string(), key: z.string() }))
    .mutation(async ({ input }) => {
      const res = await sendMessage(input);

      if (res.ok) {
        return res;
      }

      throw new tError({ code: "INTERNAL_SERVER_ERROR", message: res.message });
    }),
});

