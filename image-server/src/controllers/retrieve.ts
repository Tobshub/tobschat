import { Request, Response } from "express";
import logger from "../config/logger";
import { Err } from "../helpers/result";
import prisma from "../config/prisma";

export default async function retrieveController(req: Request, res: Response) {
  try {
    const { url } = req.params;
    const image = await prisma.image.findUnique({
      where: { url },
      select: { data: true, type: true, length: true },
    });
    if (!image) {
      res.status(400).send(Err("Image not found"));
      return;
    }

    res.setHeader("Content-Type", image.type);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Length", image.length);
    res.status(200).send(image.data);
  } catch (e) {
    logger.error(e, "Failed to get image");
    res.status(500).send(Err());
  }
}
