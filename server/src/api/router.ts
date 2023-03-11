import { roomRouter, userRouter } from ".";
import { tRouter } from "@/config/trpc";

export const appRouter = tRouter({
  user: userRouter,
  room: roomRouter,
});

export type AppRouter = typeof appRouter;

