import { Parser } from "./parser";
import { ParsedDocument,MemoryBasedFile } from "@/types";

/**
 * 文本解析器
 */
class TextParser implements Parser {

    /**
     * 最大解析文件大小
     */
    readonly maxSize = 1024 * 1024 * 1;

    /**
     * 支持的文件扩展名
     */
    readonly extensions = new Set([
        "txt",

        "md",
        "markdown",

        "json",
        "jsonl",

        "yaml",
        "yml",

        "xml",

        "csv",
        "tsv",

        "ini",
        "toml",
        "conf",

        "env",
        "properties",

        "log",

        "js",
        "jsx",

        "ts",
        "tsx",

        "vue",

        "html",
        "css",

        "py",
        "java",
        "kt",
        "go",
        "rs",
        "php",
        "rb",
        "cs",

        "sql",
    ]);

    /**
     * 检查解析器是否支持解析文件类型
     */
    supports(file: MemoryBasedFile) {
        if (file.size > this.maxSize) {
            return false;
        }
        const ext =
            file.name.split(".").pop()?.toLowerCase();
        return !!ext && this.extensions.has(ext);
    }

    /**
     * 解析文件
     * @param file 文件
     */
    async parse(file: MemoryBasedFile): Promise<ParsedDocument> {
        const content =
            await file.buffer.toString();
        return {
            type: "text",
            fileName: file.name,
            mimeType: file.mimetype,
            size: file.size,
            content,
        };
    }
}

export const textParser = new TextParser();
