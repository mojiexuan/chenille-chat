import type { FastifyInstance } from "fastify";
import fastifyMultipart from "@fastify/multipart";

/**
 * 处理multipart请求
 * @param fastify Fastify实例
 */
export async function multipartPlugin(fastify: FastifyInstance) {
    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 2 * 1024 * 1024, // 2MB
        },
    });
}