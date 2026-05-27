import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Redis } from "ioredis";
import { config } from "@/config";
import { logger } from "@/utils";



/**
 * Redis 插件。
 */
async function redisPlugin(fastify: FastifyInstance) {
    const redis = new Redis({
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

    redis.on("connect", () => {
        logger.info({ msg: "Redis 连接成功" }, "Redis 连接成功");
    });

    redis.on("error", (err) => {
        logger.error({ err: (err as Error).message }, "Redis 连接失败");
    });

    await redis.connect();

    fastify.decorate("redis", redis);

    fastify.addHook("onClose", async () => {
        await redis.disconnect();
        logger.info({ msg: "Redis 连接已关闭" }, "Redis 连接已关闭");
    });
}

export const redisClientPlugin = fp(redisPlugin, { name: "redis" });