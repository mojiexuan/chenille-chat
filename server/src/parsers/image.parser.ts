import { BizCode } from "@/enumeration";
import { BizException } from "@/exception";
import { Parser } from "@/parsers";
import { ParsedDocument } from "@/types";
import { agentService } from "@/services";
import { createAiModel } from "@/models";

/**
 * 图片解析器
 */
class ImageParser implements Parser {

    /**
     * 最大解析文件大小
     */
    readonly maxSize = 1024 * 1024 * 10;

    /**
     * 支持的文件扩展名
     */
    readonly extensions = new Set([
        "jpg",
        "jpeg",
        "png"
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
        const agent = await agentService.getVisionRecognitionAgent();
        if (!agent) {
            throw new BizException(BizCode.VISION_AGENT_NOT_CONFIGURED);
        }
        const aiModel = createAiModel({
            provider: agent.provider.provider,
            apiKey: agent.provider.apiKey,
            model: agent.model.modelName,
            baseURL: agent.provider.baseUrl,
        });
        let url = "";

        throw new BizException(BizCode.FAIL, "TODO: Image Parser")
    }
}

export const imageParser = new ImageParser();