import pino from "pino";

const _LOG = pino({ transport: { target: "pino-pretty" } });

export default function LOG<T extends "info" | "warn" | "error" | "debug">(level: T, main: any, ...args: any[]) {
  _LOG[level](main, ...args);
}

