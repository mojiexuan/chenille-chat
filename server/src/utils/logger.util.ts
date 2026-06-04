import { pino } from "pino";
import { config } from "@/config";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "logs");
const isDev = config.NODE_ENV === "development";

// 应用日志
const appLog = {
    target: "pino-roll",
    level: "info",
    options: {
        file: path.join(LOG_DIR, "app"),
        frequency: "daily",
        size: isDev ? "10m" : "50m",
        dateFormat: "yyyy-MM-dd",
        extension: ".log",
        mkdir: true,
        limit: { count: isDev ? 7 : 30 },
    },
}

// 错误日志
const errorLog = {
    target: "pino-roll",
    level: "error",
    options: {
        file: path.join(LOG_DIR, "error"),
        frequency: "daily",
        size: isDev ? "10m" : "50m",
        dateFormat: "yyyy-MM-dd",
        extension: ".log",
        mkdir: true,
        limit: { count: isDev ? 7 : 30 },
    },
};

// 日志记录器
export const logger = pino({
    level: isDev ? "debug" : "info",
    name: config.APP_NAME,
    redact: ["req.headers.authorization"],
    ...(
        config.NODE_ENV === "development" ? {
            transport: {
                targets: isDev ? [
                    {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
                            ignore: "pid,hostname",
                            singleLine: false,
                        },
                    },
                    appLog,
                    errorLog,
                ] : [appLog, errorLog],
            },
        } : {}
    ),
});