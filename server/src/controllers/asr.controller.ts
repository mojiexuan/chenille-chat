import type { FastifyRequest, FastifyReply } from "fastify";
import { asrService } from "@/services";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 语音识别
 */
export async function asrRecognizeHandler(request: FastifyRequest, reply: FastifyReply,) {
    const file = await request.file();
    if (!file) {
        throw new BizException(BizCode.FILE_NOT_FOUND);
    }
    const text = await asrService.recognizeAudio(file);
    return reply.success(text, "语音识别成功");
}