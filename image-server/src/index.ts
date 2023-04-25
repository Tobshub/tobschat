import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { PrismaConn } from "./config/prisma";
import logger from "./config/logger";

const app = express();

app.use(express.json({ limit: "5mb" }), cors());

const port = process.env.PORT ?? 4000;

PrismaConn().then(() =>
  app.listen(port, () => {
    logger.info("live on ::4000");
  })
);
