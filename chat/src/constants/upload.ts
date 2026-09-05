// 支持的文件类型
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

// 支持的图片类型
export const AI_CHAT_ACCEPTED_IMAGE_TYPES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
] as const;