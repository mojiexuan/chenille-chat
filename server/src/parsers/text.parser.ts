import { Parser } from "./parser";
import { ParsedDocument, MemoryBasedFile } from "@/types";

/**
 * 文本解析器
 */
class TextParser extends Parser {

    /**
     * 最大解析文件大小
     */
    readonly maxSize = 1024 * 1024 * 0.1;
    /**
     * 最大解析文件数量
     */
    readonly maxCount = 10;

    /**
     * 支持的文件扩展名
     */
    readonly types = new Set([
        {
            ext: "txt",
            mime: "text/plain",
        },
        {
            ext: "md",
            mime: "text/markdown",
        },
        {
            ext: "json",
            mime: "application/json",
        }
    ]);

    /**
     * 解析文件
     * @param files 文件列表
     */
    async parse(files: MemoryBasedFile[]): Promise<ParsedDocument[]> {
        return Promise.all(files.map(file => ({
            type:"text" as const,
            fileName: file.name,
            mimeType: file.type.mime,
            size: file.size,
            content: file.buffer.toString("utf-8"),
        })))
    }
}

export const textParser = new TextParser();
