import { pino } from "pino";
import { config } from "@/config";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "logs");

export const logger = pino({
    level: "info",
    name: config.APP_NAME,
    redact: ["req.headers.authorization"],
    ...(
        config.NODE_ENV === "development" ? {
            transport: {
                targets: [
                    {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
                            ignore: "pid,hostname",
                            singleLine: false,
                        },
                    },
                    {
                        target: "pino/file",
                        level: "info",
                        options: {
                            destination: path.join(LOG_DIR, "app.log"),
                            mkdir: true,
                        },
                    }
                ]
            },
        } : {}
    ),
});