import pino from "pino";

const LOG = pino({ transport: { target: "pino-pretty" } });

const logger: Pick<typeof LOG, "info" | "error"> = {
  info: (obj: any, msg: any, ...args: any[]) => {
    LOG.info(obj, msg, ...args);
  },
  error: (obj: any, msg: any, ...args: any[]) => {
    LOG.error(obj, msg, ...args);
  },
};

export default logger;
