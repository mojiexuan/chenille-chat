import { ParsedDocument } from "@/types";

/**
 * 解析器接口
 */
export interface Parser {
    /**
     * 检查解析器是否支持解析文件类型
     */
    supports(file: File): boolean;
    /**
     * 解析文件
     * @param file 文件
     */
    parse(file: File): Promise<ParsedDocument>;
}