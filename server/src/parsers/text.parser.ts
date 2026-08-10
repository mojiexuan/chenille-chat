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
     * 解析文件
     * @param files 文件列表
     */
    async parse(files: MemoryBasedFile[]): Promise<ParsedDocument[]> {
        return Promise.all(files.map(file => ({
            type:"text" as const,
            fileName: file.name,
            mimeType: file.mimetype,
            size: file.size,
            content: file.buffer.toString("utf-8"),
        })))
    }
}

export const textParser = new TextParser();
