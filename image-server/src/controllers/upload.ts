import logger from "../config/logger";
import { Request, Response } from "express";
import prisma, { type Image } from "../config/prisma";
import { Err, Ok } from "../helpers/result";
import z from "zod";

const imageType = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  data: z.string(),
  duration: z.string().datetime(),
  roomBlob: z.string(),
  senderPublicId: z.string(),
  url: z.string(),
  createdAt: z.string(),
  acknowledged: z.boolean(),
});

export default async function uploadController(req: Request, res: Response) {
  try {
    // FIXIT: do some data type validation
    const { data, type, name, senderPublicId, roomBlob } = await req.body;
    const image = {
      data,
      type,
      name,
      // use a default duration of 30 days
      duration: new Date(Date.now() + 1000 * 60 * 60 * 24),
      senderPublicId,
      roomBlob,
      acknowledged: false,
    };
    await uploadImage(image).then((data) => {
      res.status(data.ok ? 200 : 500).send(data);
    });
  } catch (err) {
    res.status(400).send(Err((err as Error).message));
  }
}

async function uploadImage(image: Omit<Image, "url" | "data" | "length"> & { data: string }) {
  try {
    const url = createUrl();
    logger.info(`uploading image with url: ${url}`);

    image = imageType.parse(image);
    const data = Buffer.from(image.data, "base64");
    await prisma.image.create({
      data: { ...image, url, data, length: data.length },
    });

    return Ok(url);
  } catch (err) {
    logger.error(err instanceof Error ? err.message : err, "Failed to upload image");
    return Err();
  }
}

function createUrl() {
  const rand = (Math.random() + 1).toString(36).substring(2);
  return `pixs_${rand}`;
}
