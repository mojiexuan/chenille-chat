import type { FastifyInstance } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import fp from "fastify-plugin";
import fastifyMultipart from "@fastify/multipart";
import { AI_CHAT_ACCEPTED_FILE_TYPES } from "@/constants";
import { validateFileExtension } from "@/utils/";


const ALLOWED_EXTENSIONS: Set<string> = new Set(AI_CHAT_ACCEPTED_FILE_TYPES);

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
        onFile: (file: MultipartFile) => validateFileExtension(file, ALLOWED_EXTENSIONS),
    });
}

export const multipartPlugin = fp(multipartPluginFn, { name: "multipart" });