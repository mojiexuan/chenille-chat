import { ParsedDocument,MemoryBasedFile } from "@/types";

/**
 * 解析器接口
 */
export abstract class Parser {

    /**
     * 最大解析文件大小
     */
    abstract maxSize: number;
    /**
     * 最大解析文件数量
     */
    abstract maxCount: number;
    
    /**
     * 支持的文件扩展名
     */
    abstract extensions: Set<string>;

    /**
     * 检查解析器是否支持解析文件类型
     */
    supports(files: MemoryBasedFile[]): boolean {
        // 检查文件数量是否超过最大数量
        if (files.length > this.maxCount) {
            return false;
        }
        // 检查文件大小是否超过最大大小
        return files.every(file => {
            if (file.size > this.maxSize) {
                return false;
            }
            const ext =
                file.name.split(".").pop()?.toLowerCase();
            return !!ext && this.extensions.has(ext);
        })
    };
    /**
     * 解析文件
     * @param files 文件列表
     */
    abstract parse(files: MemoryBasedFile[]): Promise<ParsedDocument[]>;
}