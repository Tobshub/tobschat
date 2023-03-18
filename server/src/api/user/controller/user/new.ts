import b from "bcrypt";
import Log from "../../../../config/log";
import { usePrisma } from "../../../../config/prisma";
import appToken from "../../../../config/token";
import { Err } from "../../../../helpers/result";

export async function newUser(userProps: {
  username: string;
  email: string;
  password: string;
}) {
  try {
    const check = await checkUser(userProps.email, userProps.username);
    if (!check) {
      Log.error("User tried to sign up with an existing email or username");
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
    Log.error(error, "failed to create new user");
    return Err("an error occured", error);
  }
}

async function checkUser(email: string, username: string) {
  const checkEmail = await usePrisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  const checkUsername = await usePrisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: { id: true },
  });

  // check fails if a user exists with the email or username
  if (checkEmail || checkUsername) {
    return false;
  }

  return true;
}
