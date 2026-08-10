/**
 * 内存化的文件对象
 */
export interface MemoryBasedFile {
    /** 文件名（含扩展名） */
    name: string;
    /** MIME 类型 */
    mimetype: string;
    /** 文件字节数 */
    size: number;
    /** 文件内容 */
    buffer: Buffer;
}