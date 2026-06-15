import type { MultipartFile } from "@fastify/multipart";
import path from "path";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 验证文件扩展名是否在允许的范围内
 * @param file 上传的文件
 * @param allowedExtensions 允许的文件扩展名
 */
export function validateFileExtension(file: MultipartFile, allowedExtensions: Set<string>) {
    const ext = path.extname(file.filename).toLowerCase();
    if (!allowedExtensions.has(ext)) {
        const err = new Error(`不支持的文件类型: ${ext}`);
        (err as any).statusCode = 400;
        throw new BizException(BizCode.FILE_INVALID_TYPE);
    }
}

/**
 * 校验文件扩展名 + 大小，返回 Buffer 供业务复用
 * @param maxSize 最大字节数，默认50MB
 */
export async function validateFile(
    file: MultipartFile,
    allowedExtensions: Set<string>,
    maxSize = 50 * 1024 * 1024,
): Promise<Buffer> {
    validateFileExtension(file, allowedExtensions);
    const buffer = await file.toBuffer();
    if (buffer.length > maxSize) {
        throw new BizException(BizCode.FILE_TOO_LARGE);
    }
    return buffer;
}