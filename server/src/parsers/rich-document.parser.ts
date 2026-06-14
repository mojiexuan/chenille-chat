import { BizCode } from "@/enumeration";
import { BizException } from "@/exception";

/**
 * 富文本解析器
 */
class RichDocumentParser {

    supports() {
        return false;
    }

    async parse() {
        throw new BizException(BizCode.FAIL, "TODO: RichDocument Parser")
    }
}

export const richDocumentParser = new RichDocumentParser();
