import type { MultipartFile } from "@fastify/multipart";
import { createAiModel } from "@/models";
import { agentService, ossService } from "@/services";
import { logger } from "@/utils";
import { MessageAttachmentType, BizCode } from "@/enumeration";
import { BizException } from "@/exception";


/**
 * 语音识别服务
 */
class AsrService {

    /**
     * 语音识别音频
     */
    async recognizeAudio(audio: MultipartFile) {
        const agent = await agentService.getAsrRecognitionAgent();
        if (!agent) {
            throw new BizException(BizCode.ASR_AGENT_NOT_CONFIGURED);
        }
        const aiModel = createAiModel({
            provider: agent.provider.provider,
            apiKey: agent.provider.apiKey,
            model: agent.model.modelName,
            baseURL: agent.provider.baseUrl,
        });
        let url = "";
        try {
            const r = await ossService.uploadFileToOss(audio);
            url = r.url;
            const result = await aiModel.generate({
                messages: [
                    {
                        type: "attachment",
                        content: [
                            {
                                type: MessageAttachmentType.Audio,
                                url: url,
                            }
                        ]
                    }
                ]
            });
            return result.message.content;
        } catch (error) {
            logger.error(error, "语音识别失败");
            throw new BizException(BizCode.ASR_ERROR);
        } finally {
            ossService.deleteFileFromOss(url);
        }
    }

}

export const asrService = new AsrService()