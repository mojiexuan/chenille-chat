import { BizCode } from "@/enumeration";
import { BizException } from "@/exception";
import { Parser } from "@/parsers";
import { ParsedDocument,MemoryBasedFile } from "@/types";

/**
 * 语音解析器
 */
class AudioParser extends Parser {

    /**
     * 最大解析文件大小
     */
    readonly maxSize = 1024 * 1024 * 10;
    /**
     * 最大解析文件数量
     */
    readonly maxCount = 10;

    /**
     * 支持的文件扩展名
     */
    readonly types = new Set([
        {
            ext: "mp3",
            mime: "audio/mpeg",
        },
        {
            ext: "wav",
            mime: "audio/wav",
        },
        {
            ext: "aac",
            mime: "audio/aac",
        }
    ]);

    /**
     * 解析文件
     * @param files 文件列表
     */
    async parse(files: MemoryBasedFile[]): Promise<ParsedDocument[]> {
        throw new BizException(BizCode.FAIL, "TODO: Audio Parser")
    }
}

export const audioParser = new AudioParser();
