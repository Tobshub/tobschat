import { TRPCError, inferAsyncReturnType, initTRPC } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import appToken from "./token";
// import context

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({
  auth: req.headers.authorization,
  id: undefined,
});

const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();

export const tRouter = t.router;
export const tProcedure = t.procedure;
export const tError = TRPCError;

export const authedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.auth) {
      throw new tError({ code: "BAD_REQUEST", message: "user token is missing" });
    }
    const validate = appToken.validate(ctx.auth);
    if (!validate.ok) {
      throw new tError({ code: "UNAUTHORIZED", message: "failed to validate token" });
    }
    return next({ ctx: { auth: undefined, id: validate.value.id } });
  })
);

