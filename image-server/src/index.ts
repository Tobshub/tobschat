import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { PrismaConn } from "./config/prisma";
import logger from "./config/logger";
import uploadController from "./controllers/upload";
import retrieveController from "./controllers/retrieve";

const app = express();

app.use(express.json({ limit: "5mb" }), cors());

// 2 MAIN ROUTES
// upload router - upload images from rooms to the database
app.post("/upload", uploadController);
// retrive router - get images from the database using the image url and send the image data
app.get("/img/:id", retrieveController);

app.use("/", (_, res) => res.send("hello world"));

const port = process.env.PORT ?? 4000;

PrismaConn().then(() =>
  app.listen(port, () => {
    logger.info(`live on ::${port}`);
  })
);
