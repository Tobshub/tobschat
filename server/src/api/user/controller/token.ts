import jwt from "jsonwebtoken";
import { env } from "../../..";
import LOG from "../../../config/log";
import { Err, Ok } from "../../../helpers/result";

const appToken = {
  /** Generates a jwt token */
  gen(id: string) {
    try {
      if (!env.jwt_secret) LOG.error("jwt secret is missing");
      // iat in seconds
      const payload = { id, iat: Date.now() / 1000 };
      const token = jwt.sign(payload, env.jwt_secret as string, { expiresIn: "30d" });
      return Ok(token);
    } catch (err) {
      LOG.error(err, "failed to generate new token");
      return Err("failed to generate token", err);
    }
  },
  /** Validates and decodes token
   *
   * Returns `Err` type if the token is invalid
   */
  validate(token: string) {
    try {
      if (!env.jwt_secret) LOG.warn("jwt secret is missing");
      const decoded = jwt.verify(token, env.jwt_secret as string) as { id: string };
      return Ok(decoded);
    } catch (err) {
      // no LOG because validation errors are expected
      return Err("failed to validate token", err);
    }
  },
};

export default appToken;

