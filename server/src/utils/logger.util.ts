import { pino } from "pino";
import { config } from "@/config";

export const logger = pino({
    level: "info",
    name: config.APP_NAME,
    redact: ["req.headers.authorization"],
    ...(
        config.NODE_ENV === "development" ? {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
                    ignore: "pid,hostname",
                    singleLine: false,
                },
            },
        } : {}
    ),
});