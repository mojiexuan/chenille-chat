/**
 * 压缩工具请求选项
 */
export interface CompressOptions {
    /** 最长边像素，默认 2048 */
    maxDimension?: number;
    /** 初始质量 1-100，默认 80 */
    quality?: number;
    /** 最低质量下限，默认 30 */
    minQuality?: number;
    /** 透明通道底色，默认 #fff（仅 jpeg 生效） */
    background?: string;
    /** 输出格式，默认 jpeg */
    format?: "jpeg" | "png" | "webp";
}

/**
 * 压缩工具响应结果
 */
export interface CompressResult {
    buffer: Buffer;
    size: number;
    quality: number;
    maxDimension: number;
    mimeType: string;
    toDataUrl(): string;
}