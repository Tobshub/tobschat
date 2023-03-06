import { Express, json } from "express";
import cors from "cors";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./config/trpc";
import { appRouter } from "./api/router";

export default function appHandler(app: Express) {
  app.use(cors(), json());
  app.use("/api", trpcExpress.createExpressMiddleware({ router: appRouter, createContext }));
}

