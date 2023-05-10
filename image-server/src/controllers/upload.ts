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
      if (data.ok) {
        res.status(200).send({ url: data.value });
        return;
      }
      res.status(500).send({ message: data.message });
    });
  } catch (err) {
    res.status(400).send({ message: (err as Error).message });
  }
}

async function uploadImage(rawImage: Omit<Image, "url" | "data"> & { data: string }) {
  try {
    const url = createUrl();
    logger.info(`uploading image with url: ${url}`);
    
    rawImage = imageType.parse(rawImage);
    await prisma.image.create({
      data: { ...rawImage, url, data: Buffer.from(rawImage.data, "base64") },
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
