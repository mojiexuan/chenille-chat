import { BizCode } from "@/enumeration";
import { BizException } from "@/exception";

/**
 * 语音解析器
 */
class AudioParser {

    supports() {
        return false;
    }

    async parse() {
        throw new BizException(BizCode.FAIL, "TODO: Audio Parser")
    }
}

export const audioParser = new AudioParser();
