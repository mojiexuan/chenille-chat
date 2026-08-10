import type { MultipartFile } from "@fastify/multipart";
import { BizException } from "@/exception";
import { Parser } from "./parser";
import { BizCode } from "@/enumeration";
import { convertFileToMemoryBasedFile } from "@/utils";

/**
 * 解析器注册器
 */
class ParserRegistry {
    // 解析器列表
    private parsers: Parser[] = [];

    /**
     * 注册解析器
     * @param parser 解析器
     */
    register(parser: Parser) {
        this.parsers.push(parser);
    }

    /**
     * 解析文件
     * @param files 文件列表
     */
    async parse(files: MultipartFile[]){
        // 将 MultipartFile 转换为 MemoryBasedFile
        const parsedFiles = await Promise.all(files.map(convertFileToMemoryBasedFile));
        // 查找解析器
        const parser = this.parsers.find(p => p.supports(parsedFiles));
        if (!parser) {
            throw new BizException(BizCode.FILE_INVALID_TYPE);
        }
        // 解析文件
        return parser.parse(parsedFiles);
    }

}

export const parserRegistry = new ParserRegistry();