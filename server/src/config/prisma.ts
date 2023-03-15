import { PrismaClient } from "@prisma/client";
import Log from "./log";

export const usePrisma = new PrismaClient();

export async function PrismaConn() {
  try {
    Log.info("Connecting to db with prisma...");
    await usePrisma.$connect().then(() => Log.info("Connected to db with prisma"));
  } catch (error) {
    Log.error(error, "db connection failed...");
  }
}

