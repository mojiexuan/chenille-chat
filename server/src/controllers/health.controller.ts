import type { FastifyInstance } from "fastify";

/**
 * 健康检查控制器
 * @param fastify Fastify实例
 */
export async function healthController(fastify: FastifyInstance) {
    fastify.get("/", async () => ({ status: "ok" }));
}