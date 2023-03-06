import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
// import context

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({ auth: req.headers.authorization });

const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

export const tRouter = t.router;
export const tProcedure = t.procedure;
export const tError = TRPCError;

