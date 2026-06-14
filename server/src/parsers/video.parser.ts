import { BizCode } from "@/enumeration";
import { BizException } from "@/exception";

/**
 * 视频解析器
 */
class VideoParser {

    supports() {
        return false;
    }

    async parse() {
        throw new BizException(BizCode.FAIL, "TODO: Video Parser")
    }
}

export const videoParser = new VideoParser();
