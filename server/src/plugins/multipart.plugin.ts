import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifyMultipart from "@fastify/multipart";

/**
 * 处理multipart请求
 * @param fastify Fastify实例
 */
async function multipartPluginFn(fastify: FastifyInstance) {
    await fastify.register(fastifyMultipart, {
        limits: {
            fileSize: 50 * 1024 * 1024, // 50MB
            files: 10, // 最多10个文件
            fieldNameSize: 100, // 最大字段名长度为100个字符
            fieldSize: 1024 * 1024, // 最大字段值为1MB
            fields: 100, // 最多100个非文件字段
            parts: 100, // 最多100个部分
            headerPairs: 2000, // 最多2000个头对值
        },
    });
}

export const multipartPlugin = fp(multipartPluginFn, { name: "multipart" });