import { Parser } from "./parser";
import { ParsedDocument } from "@/types";

/**
 * 文本解析器
 */
class TextParser implements Parser {

    private readonly extensions = new Set([
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

    supports(file: File) {
        const ext =
            file.name.split(".").pop()?.toLowerCase();
        return !!ext && this.extensions.has(ext);
    }

    async parse(file: File): Promise<ParsedDocument> {
        const content =
            await file.text();
        return {
            type: "text",
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            content,
        };
    }
}

export const textParser = new TextParser();
