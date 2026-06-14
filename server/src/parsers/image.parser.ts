import { BizCode } from "@/enumeration";
import { BizException } from "@/exception";

/**
 * 图片解析器
 */
class ImageParser {

    supports() {
        return false;
    }

    async parse() {
        throw new BizException(BizCode.FAIL, "TODO: Image Parser")
    }
}

export const imageParser = new ImageParser();