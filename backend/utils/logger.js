/**
 * Lightweight structured logger.
 * - Development: colorized, verbose output
 * - Production: JSON format for log aggregation services
 * - Test: silent
 */
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = () => {
    const env = process.env.NODE_ENV || "development";
    if (env === "test") return -1; // silent
    if (env === "production") return LOG_LEVELS.info;
    return LOG_LEVELS.debug;
};

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const env = process.env.NODE_ENV || "development";

    if (env === "production") {
        return JSON.stringify({ timestamp, level, message, ...meta });
    }

    const colors = { error: "\x1b[31m", warn: "\x1b[33m", info: "\x1b[36m", debug: "\x1b[90m" };
    const reset = "\x1b[0m";
    const color = colors[level] || reset;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${color}[${timestamp}] ${level.toUpperCase()}:${reset} ${message}${metaStr}`;
};

const log = (level, message, meta) => {
    if (LOG_LEVELS[level] > currentLevel()) return;
    const formatted = formatMessage(level, message, meta);
    const consoleFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    consoleFn(formatted);
};

const logger = {
    error: (msg, meta) => log("error", msg, meta),
    warn: (msg, meta) => log("warn", msg, meta),
    info: (msg, meta) => log("info", msg, meta),
    debug: (msg, meta) => log("debug", msg, meta),
};

export default logger;
