import { tRouter } from "../config/trpc";
import { roomRouter, userRouter } from "./index";

export const appRouter = tRouter({
  user: userRouter,
  room: roomRouter,
});

export type AppRouter = typeof appRouter;

