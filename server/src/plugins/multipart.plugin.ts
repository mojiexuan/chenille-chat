import type { FastifyInstance } from "fastify";
import type { MultipartFile } from "@fastify/multipart";
import fp from "fastify-plugin";
import fastifyMultipart from "@fastify/multipart";
import { USER_AVATAR_IMAGE_TYPES } from "@/constants";
import { validateFileType,convertFileToMemoryFile } from "@/utils";
import { FileType } from "@/types";


// 允许的文件类型
const ALLOWED_TYPES: Set<FileType> = new Set([
    ...USER_AVATAR_IMAGE_TYPES,
]);

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
        onFile: async (file: MultipartFile) => {
            const MemoryFile = await convertFileToMemoryFile(file);
            validateFileType(MemoryFile, ALLOWED_TYPES);
        }
    });
}

export const multipartPlugin = fp(multipartPluginFn, { name: "multipart" });