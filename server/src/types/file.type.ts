/**
 * 文件类型
 */
export interface FileType {
    /** 文件扩展名 */
    ext: string;
    /** MIME 类型 */
    mime: string;
}

/**
 * 内存化的文件对象
 */
export interface MemoryBasedFile {
    /** 文件名（含扩展名） */
    name: string;
    /** 文件类型 */
    type: FileType;
    /** 文件字节数 */
    size: number;
    /** 文件内容 */
    buffer: Buffer;
}