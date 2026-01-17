import { Logtail } from "@logtail/node";

/* =========================
   Environment setup
   ========================= */

const isProduction = process.env.NODE_ENV === "production";

const logtail =
  isProduction && process.env.BETTER_STACK_SOURCE_TOKEN
    ? new Logtail(process.env.BETTER_STACK_SOURCE_TOKEN, {
        endpoint: process.env.BETTER_STACK_ENDPOINT,
      })
    : null;

/* =========================
   Types
   ========================= */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

export interface Logger {
  debug: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
  child: (meta: LogMeta) => Logger;
}

/* =========================
   Low-level emitter
   ========================= */

function emit(level: LogLevel, message: string, meta?: LogMeta) {
  if (logtail) {
    logtail[level](message, meta);
  } else {
    const output = meta ? `${message} ${JSON.stringify(meta)}` : message;

    console[level === "debug" ? "log" : level](output);
  }
}

/* =========================
   Logger factory
   ========================= */

function createLogger(boundMeta: LogMeta = {}): Logger {
  const log = (level: LogLevel) => (message: string, meta?: LogMeta) =>
    emit(level, message, {
      ...boundMeta,
      ...meta,
    });

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),

    child: (meta: LogMeta) =>
      createLogger({
        ...boundMeta,
        ...meta,
      }),
  };
}

/* =========================
   Root logger
   ========================= */

export const logger: Logger = createLogger();
