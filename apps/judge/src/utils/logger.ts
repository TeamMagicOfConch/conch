/**
 * 안전한 로거 - 원문(system/user/assistant)을 로그에 포함하지 않음
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

const currentLogLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "INFO";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog("DEBUG")) {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog("INFO")) {
      console.info(formatMessage("INFO", message, meta));
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog("WARN")) {
      console.warn(formatMessage("WARN", message, meta));
    }
  },

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    if (shouldLog("ERROR")) {
      const errorMeta = error instanceof Error
        ? { error: error.message, stack: error.stack, ...meta }
        : { error: String(error), ...meta };
      console.error(formatMessage("ERROR", message, errorMeta));
    }
  },
};

