import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { redis } from "@/db";
import { logger } from "@/utils";

/**
 * Redis 插件。
 */
async function redisPlugin(fastify: FastifyInstance) {
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