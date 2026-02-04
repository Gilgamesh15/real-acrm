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
   Pretty formatting for dev
   ========================= */

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Level colors
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red

  // Semantic colors
  gray: "\x1b[90m",
  blue: "\x1b[34m",
};

function formatMeta(meta: LogMeta): string {
  if (!meta || Object.keys(meta).length === 0) return "";

  const entries = Object.entries(meta).map(([key, value]) => {
    const formattedValue =
      typeof value === "string" ? `"${value}"` : JSON.stringify(value, null, 2);

    return `${colors.dim}${key}:${colors.reset} ${formattedValue}`;
  });

  return "\n  " + entries.join("\n  ");
}

function prettyLog(level: LogLevel, message: string, meta?: LogMeta) {
  const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
  const levelColor = colors[level];
  const levelLabel = level.toUpperCase().padEnd(5);

  const formattedMessage =
    `${colors.gray}[${timestamp}]${colors.reset} ` +
    `${levelColor}${levelLabel}${colors.reset} ` +
    `${colors.bright}${message}${colors.reset}` +
    `${formatMeta(meta || {})}`;

  console.log(formattedMessage);
}

/* =========================
   Low-level emitter
   ========================= */

function emit(level: LogLevel, message: string, meta?: LogMeta) {
  if (logtail) {
    logtail[level](message, meta);
  } else {
    prettyLog(level, message, meta);
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
