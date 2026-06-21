import { Redis } from "ioredis";
import { config } from "@/config";
import { logger } from "@/utils";

/**
 * Redis数据库连接
 */
export const redis = new Redis({
    host: config.REDIS_HOST,
    port: Number(config.REDIS_PORT),
    password: void 0,
    lazyConnect: true,
    retryStrategy: (times) => {
        if (times >= 3) {
            logger.error({ err: "Redis 重连失败，已达最大重试次数" }, "Redis 连接失败");
            return null;
        }
        return 1000;
    },
});