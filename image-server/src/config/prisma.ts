import { PrismaClient } from "@prisma/client";
import logger from "./logger";

/** Prisma Client wrapper */
const prisma = new PrismaClient();

export async function PrismaConn() {
  logger.info("Prisma Client connecting...");
  await prisma
    .$connect()
    .then(() => {
      logger.info("Prisma Client connected");
    })
    .catch((e) => {
      logger.error(e, "Prisma Client connection failed");
    });
}

export default prisma;
