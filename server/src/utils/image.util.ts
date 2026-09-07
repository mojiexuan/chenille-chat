import sharp from "sharp";
import { CompressOptions, CompressResult, MemoryFile } from "@/types";

/**
 * 图片格式映射
 */
const MIME_MAP: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

/**
 * 压缩图片到指定大小
 * @param file 图片文件
 * @param targetSizeBytes 目标大小（字节）
 * @param options 压缩选项
 * @returns 压缩结果
 */
export async function compressToTargetSize(file:MemoryFile, targetSizeBytes: number, options: CompressOptions = {}): Promise<CompressResult> {
    const {
        maxDimension: initDim = 2048,
        quality: initQuality = 80,
        minQuality = 30,
        background = "#fff",
        format = "jpg",
    } = options;
    const input = file.buffer;
    // 原图已小于目标，直接返回
    if (input.length < targetSizeBytes) {
        return buildResult(input, format, initQuality, initDim);
    }
    // 最小边像素
    const minDimension = 256;
    // 质量步长
    const qualityStep = 10;
    // 最大边像素
    let maxDimension = initDim;
    // 初始质量
    let quality = initQuality;
    let output = Buffer.alloc(0);

    // 循环压缩
    while (true) {
        // 压缩管道
        let pipeline = sharp(input)
            .rotate()
            .resize({
                width: maxDimension,
                height: maxDimension,
                fit: "inside",
                withoutEnlargement: true,
            });

        if (format === "jpg") {
            // 压缩 JPG 图片
            pipeline = pipeline
                .flatten({ background })
                .jpeg({ quality, mozjpeg: true });
        } else if (format === "webp") {
            // 压缩 WebP 图片
            pipeline = pipeline.webp({ quality });
        } else {
            // 压缩 PNG 图片
            pipeline = pipeline.png({
                compressionLevel: 9,
                palette: true,
                quality,
            });
        }

        // 执行压缩
        output = await pipeline.toBuffer();

        // 压缩大小是否符合目标
        if (output.length < targetSizeBytes) break;

        // 质量是否需要调整
        if (quality > minQuality) {
            quality = Math.max(minQuality, quality - qualityStep);
            continue;
        }

        // 边像素是否需要调整
        if (maxDimension > minDimension) {
            maxDimension = Math.max(minDimension, Math.round(maxDimension * 0.8));
            quality = initQuality;
            continue;
        }

        // 压缩完成
        break;
    }

    return buildResult(output, format, quality, maxDimension);
}

/**
 * 构建压缩结果
 */
function buildResult(
    buffer: Buffer,
    format: string,
    quality: number,
    maxDimension: number,
): CompressResult{
    const mimeType = MIME_MAP[format] ?? "image/jpeg";
    return {
        buffer,
        size: buffer.length,
        quality,
        maxDimension,
        type:{
            ext:format,
            mime:mimeType,
        },
        toDataUrl() {
            return `data:${mimeType};base64,${buffer.toString("base64")}`;
        },
    };
}