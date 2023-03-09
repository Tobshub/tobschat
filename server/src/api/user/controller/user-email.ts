import LOG from "../../../config/log";
import { usePrisma } from "../../../config/prisma";
import { Err, Ok } from "../../../helpers/result";
import appToken from "./token";

export async function getUser(token: string) {
  try {
    const validate = appToken.validate(token);
    if (!validate.ok) {
      return validate;
    }
    const user = await usePrisma.user.findUnique({ where: { id: validate.value.id }, select: { email: true } });

    if (!user) {
      return Err("user not found");
    }

    return Ok(user);
  } catch (err) {
    LOG("error", err, "Error: failed to get username");
    return Err("");
  }
}

