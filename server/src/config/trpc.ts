import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import appToken from "./token";
import Log from "./log";
// import context

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({
  auth: req.headers.authorization,
  id: undefined,
});

export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const tRouter = t.router;
export const tProcedure = t.procedure;
export const tError = TRPCError;

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth) {
    Log.error(["Tried to access Authed Procedure without a token"]);
    throw new tError({ code: "BAD_REQUEST", message: "user token is missing" });
  }
  const validate = appToken.validate(ctx.auth);
  if (!validate.ok) {
    Log.error(["Failed to Validate token", ctx.auth]);
    throw new tError({ code: "UNAUTHORIZED", message: "failed to validate token" });
  }
  return next({ ctx: { auth: undefined, id: validate.value.id } });
});

export const authedProcedure = t.procedure.use(authMiddleware);

