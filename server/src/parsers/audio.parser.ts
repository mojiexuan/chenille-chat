import { BizCode } from "@/enumeration";
import { BizException } from "@/exception";
import { Parser } from "@/parsers";
import { ParsedDocument } from "@/types";

/**
 * 语音解析器
 */
class AudioParser implements Parser {

    /**
     * 最大解析文件大小
     */
    readonly maxSize = 1024 * 1024 * 10;

    /**
     * 支持的文件扩展名
     */
    readonly extensions = new Set([
        "mp3",
        "wav",
        "aac",
    ]);

    /**
     * 检查解析器是否支持解析文件类型
     */
    supports(file: File) {
        if (file.size > this.maxSize) {
            return false;
        }
        const ext =
            file.name.split(".").pop()?.toLowerCase();
        return !!ext && this.extensions.has(ext);
    }

    /**
     * 解析文件
     * @param file 文件
     */
    async parse(file: File): Promise<ParsedDocument> {
        throw new BizException(BizCode.FAIL, "TODO: Audio Parser")
    }
}

export const audioParser = new AudioParser();
