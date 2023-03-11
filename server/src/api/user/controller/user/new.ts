import b from "bcrypt";
import LOG from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import appToken from "../../../../config/token";
import { Err } from "../../../../helpers/result";

export async function newUser(userProps: { username: string; email: string; password: string }) {
  try {
    const check = await checkUser(userProps.email);
    if (check) {
      return Err("user already exists");
    }

    const hashedPassword = await b.hash(userProps.password, 10);

    const user = await usePrisma.user.create({
      data: { ...userProps, password: hashedPassword },
      select: { id: true, username: true },
    });

    const genToken = appToken.gen(user.id);

    return genToken;
  } catch (error) {
    LOG.error(error, "failed to create new user");
    return Err("an error occured", error);
  }
}

async function checkUser(email: string) {
  const user = await usePrisma.user.findUnique({ where: { email }, select: { id: true } });
  return user ? true : false;
}

