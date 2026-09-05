import { ParsedDocument,MemoryBasedFile,FileType } from "@/types";
import { validateFile } from "@/utils";

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
    abstract types: Set<FileType>;

    /**
     * 检查解析器是否支持解析文件类型
     */
    supports(files: MemoryBasedFile[]): boolean {
        for (const file of files) {
            validateFile(file, this.types);
        }
        return true;
    };
    /**
     * 解析文件
     * @param files 文件列表
     */
    abstract parse(files: MemoryBasedFile[]): Promise<ParsedDocument[]>;
}