import { BizException } from "@/exception";
import { Parser } from "./parser";
import { BizCode } from "@/enumeration";

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
     * 查找解析器
     * @param file 文件
     * @returns 解析器
     */
    findParser(file: File): Parser {
        const parser = this.parsers.find(p => p.supports(file))
        if (!parser) {
            throw new BizException(BizCode.FILE_INVALID_TYPE);
        }
        return parser;
    }
}

export const parserRegistry = new ParserRegistry();