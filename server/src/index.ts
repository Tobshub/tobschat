import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import socketHandler from "./socket";
import appHandler from "./app";
import LOG from "./config/log";
import { PrismaConn } from "./config/prisma";

config();
PrismaConn();

export const env = {
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
  db_uri: process.env.DATABASE_URL,
};

const app = express();

appHandler(app);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

socketHandler(io);

httpServer.listen(env.port, () => {
  LOG("info", `live ::${env.port}`);
});

