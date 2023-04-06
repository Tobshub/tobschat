import express from "express";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import appHandler from "./app";
import Log from "./config/log";
import { PrismaConn } from "./config/prisma";
import socketHandler from "./socket";

config();

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

PrismaConn().then(() => 
  httpServer.listen(env.port, () => {
    Log.info(`live ::${env.port}`);
  })
);
