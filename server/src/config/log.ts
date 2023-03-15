import pino from "pino";

const _LOG = pino({ transport: { target: "pino-pretty" } });

const Log = {
  info: (info: any, message?: string, ...args: any[]) => _LOG.info(info, message, ...args),
  warn: (warning: any, message?: string, ...args: any[]) => _LOG.warn(warning, message, ...args),
  error: (error: any, message?: string, ...args: any[]) => _LOG.error(error, message, ...args),
  debug: (info: any, message?: string, ...args: any[]) => _LOG.debug(info, message, ...args),
};

export default Log;

