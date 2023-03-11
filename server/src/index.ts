import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import appHandler from "./app";
import LOG from "./config/log";
import { PrismaConn } from "./config/prisma";
import socketHandler from "./socket";

config();
PrismaConn();

export const env = {
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
};

const app = express();

appHandler(app);

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: "*" },
});

socketHandler(io);

httpServer.listen(env.port, () => {
  LOG.info(`live ::${env.port}`);
});

