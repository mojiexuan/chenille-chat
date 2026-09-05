import type { MultipartFile } from "@fastify/multipart";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { MemoryBasedFile,FileType } from "@/types";
import { fileTypeFromBuffer } from "file-type";
import {randomUUID} from './crypto.util';

/**
 * 获取真实文件类型
 * @param buffer 文件内容
 */
async function getFileType(buffer:Buffer){
    const result = await fileTypeFromBuffer(buffer);
    if (!result) {
        // 未知文件类型
        throw new BizException(BizCode.FILE_TYPE_UNKNOWN);
    }
    return result;
}

/**
 * 验证文件类型是否在允许的范围内
 * @param file 上传的文件
 * @param allowedTypes 允许的文件类型
 */
export function validateFileType(file: MemoryBasedFile, allowedTypes: Set<FileType>) {
    const allowed = [...allowedTypes].some((t)=>t.mime === file.type.mime);
    if (!allowed) {
        // 不支持的文件类型
        throw new BizException(BizCode.FILE_INVALID_TYPE);
    }
}

/**
 * 验证文件大小是否在允许的范围内
 * @param file 上传的文件
 * @param maxSize 最大字节数，默认50MB
 */
export function validateFileSize(file: MemoryBasedFile, maxSize = 50 * 1024 * 1024) {
    if (file.size > maxSize) {
        throw new BizException(BizCode.FILE_TOO_LARGE);
    }
}

/**
 * 校验文件类型 + 大小是否在允许的范围内
 * @param file 上传的文件
 * @param allowedTypes 允许的文件类型
 * @param maxSize 最大字节数，默认50MB
 */
export function validateFile(
    file: MemoryBasedFile,
    allowedTypes: Set<FileType>,
    maxSize = 50 * 1024 * 1024,
) {
    validateFileType(file, allowedTypes);
    validateFileSize(file, maxSize);
}

/**
 * 将 MultipartFile 转换为 MemoryBasedFile，不校验文件类型 + 大小
 */
export async function convertFileToMemoryBasedFile(file: MultipartFile): Promise<MemoryBasedFile> {
    const buffer = await file.toBuffer();
    const type = await getFileType(buffer);
    return {
        originalName: file.filename || '',
        name: randomUUID() + '.' + type.ext,
        type,
        size: buffer.length,
        buffer,
    };
}