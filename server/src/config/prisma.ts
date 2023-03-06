import { PrismaClient } from "@prisma/client";
import LOG from "./log";

export const usePrisma = new PrismaClient();

export async function PrismaConn() {
  try {
    await usePrisma.$connect().then(() => LOG("info", "Connected to db with prisma"));
  } catch (error) {
    LOG("error", error, "db connection failed...");
  }
}

