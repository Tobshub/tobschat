import LOG from "../../../config/log";
import { usePrisma } from "../../../config/prisma";
import { Err } from "../../../helpers/result";
import b from "bcrypt";
import appToken from "./token";

export async function login(userProps: { email: string; password: string }) {
  try {
    const user = await usePrisma.user.findUnique({
      where: { email: userProps.email },
      select: { id: true, password: true },
    });
    if (!user) {
      return Err("not found");
    }

    const validPassword = await passwordCompare(userProps.password, user.password);

    if (!validPassword) {
      // an invalid password entry should be treated the same as an invalid email entry
      return Err("not found");
    }

    const genToken = appToken.gen(user.id);

    return genToken;
  } catch (err) {
    LOG("error", err, "Error: login fail");
    return Err("an error occured", err);
  }
}

async function passwordCompare(plain: string, hashed: string) {
  const eq = await b.compare(plain, hashed);
  return eq;
}

