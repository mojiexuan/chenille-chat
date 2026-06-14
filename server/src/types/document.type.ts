export type DocumentType =
    | "text"
    | "rich-document"
    | "image"
    | "audio"
    | "video";

export interface ParsedDocument {
    // 文档类型
    type: DocumentType;
    // 文件名
    fileName: string;
    // 文件类型
    mimeType: string;
    // 文件大小
    size: number;
    // 文档内容
    content: string;
    // 元数据
    metadata?: Record<string, unknown>;
}