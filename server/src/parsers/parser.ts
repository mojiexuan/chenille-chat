import { ParsedDocument,MemoryBasedFile } from "@/types";

/**
 * 解析器接口
 */
export interface Parser {

    /**
     * 最大解析文件大小
     */
    readonly maxSize: number;
    
    /**
     * 支持的文件扩展名
     */
    readonly extensions: Set<string>;

    /**
     * 检查解析器是否支持解析文件类型
     */
    supports(file: MemoryBasedFile): boolean;
    /**
     * 解析文件
     * @param file 文件
     */
    parse(file: MemoryBasedFile): Promise<ParsedDocument>;
}