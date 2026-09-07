import type { MultipartFile } from "@fastify/multipart";
import { BizException } from "@/exception";
import { BizCode, MediaType } from "@/enumeration";
import { MemoryFile,FileType } from "@/types";
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
 * 获取文件类型对应的媒体类型
 * @param fileType 文件类型
 */
function getAttachmentType(fileType: FileType): MediaType {
    if (fileType.mime.startsWith('image/')) return MediaType.Image;
    if (fileType.mime.startsWith('video/')) return MediaType.Video;
    if (fileType.mime.startsWith('audio/')) return MediaType.Audio;
    return MediaType.File;
}

/**
 * 验证文件类型是否在允许的范围内
 * @param file 上传的文件
 * @param allowedTypes 允许的文件类型
 */
export function validateFileType(file: MemoryFile, allowedTypes: Set<FileType>) {
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
export function validateFileSize(file: MemoryFile, maxSize = 50 * 1024 * 1024) {
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
    file: MemoryFile,
    allowedTypes: Set<FileType>,
    maxSize = 50 * 1024 * 1024,
) {
    validateFileType(file, allowedTypes);
    validateFileSize(file, maxSize);
}

/**
 * 将 MultipartFile 转换为 MemoryFile，不校验文件类型 + 大小
 */
export async function convertFileToMemoryFile(file: MultipartFile): Promise<MemoryFile> {
    const buffer = await file.toBuffer();
    const type = await getFileType(buffer);
    return {
        originalName: file.filename || '',
        name: randomUUID() + '.' + type.ext,
        type,
        media: getAttachmentType(type),
        size: buffer.length,
        buffer,
    };
}