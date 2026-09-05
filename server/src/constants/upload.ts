import { FileType } from "@/types";

/**
 * 用户头像允许的文件类型
 */
export const USER_AVATAR_IMAGE_TYPES: Set<FileType> = new Set([
    { ext: "jpg", mime: "image/jpeg", },
    { ext: "png", mime: "image/png", },
    { ext: 'webp', mime: 'image/webp' },
    { ext: 'avif', mime: 'image/avif' }
]);

/**
 * AI聊天允许的图片类型
 */
export const AI_CHAT_ACCEPTED_IMAGE_TYPES: Set<FileType> = new Set([
    { ext: "jpg", mime: "image/jpeg", },
    { ext: "png", mime: "image/png", },
    { ext: 'gif', mime: 'image/gif' },
    { ext: 'webp', mime: 'image/webp' }
]);

/**
 * AI聊天允许的文件类型
 */
export const AI_CHAT_ACCEPTED_FILE_TYPES = [
    ".txt",

    ".md",
    ".markdown",

    ".json",
    ".jsonl",

    ".yaml",
    ".yml",

    ".xml",

    ".csv",
    ".tsv",

    ".ini",
    ".toml",
    ".conf",

    ".env",
    ".properties",

    ".log",

    ".js",
    ".jsx",

    ".ts",
    ".tsx",

    ".vue",

    ".html",
    ".css",

    ".py",
    ".java",
    ".kt",

    ".go",
    ".rs",

    ".php",
    ".rb",

    ".cs",

    ".sql",
] as const;