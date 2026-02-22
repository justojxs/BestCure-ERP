// simple structured logger
// dev: colorized output, prod: JSON for log aggregation, test: silent

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = () => {
    const env = process.env.NODE_ENV || "development";
    if (env === "test") return -1;
    if (env === "production") return LOG_LEVELS.info;
    return LOG_LEVELS.debug;
};

const formatMessage = (level: LogLevel, message: string, meta: any = {}) => {
    const timestamp = new Date().toISOString();
    const env = process.env.NODE_ENV || "development";

    if (env === "production") {
        return JSON.stringify({ timestamp, level, message, ...meta });
    }

    const colors: Record<LogLevel, string> = { error: "\x1b[31m", warn: "\x1b[33m", info: "\x1b[36m", debug: "\x1b[90m" };
    const reset = "\x1b[0m";
    const color = colors[level] || reset;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${color}[${timestamp}] ${level.toUpperCase()}:${reset} ${message}${metaStr}`;
};

const log = (level: LogLevel, message: string, meta?: any) => {
    if (LOG_LEVELS[level] > currentLevel()) return;
    const formatted = formatMessage(level, message, meta);
    const consoleFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    consoleFn(formatted);
};

const logger = {
    error: (msg: string, meta?: any) => log("error", msg, meta),
    warn: (msg: string, meta?: any) => log("warn", msg, meta),
    info: (msg: string, meta?: any) => log("info", msg, meta),
    debug: (msg: string, meta?: any) => log("debug", msg, meta),
};

export default logger;
