import type { FastifyRequest, FastifyReply } from "fastify";
import { chatSseDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { AiService } from "@/services";

/**
 * 聊天控制器
 * @param request 请求
 * @param reply 响应
 */
export async function chatSseHandler(request: FastifyRequest, reply: FastifyReply) {
    const parsed = chatSseDto.safeParse(request.body);
    if (!parsed.success) {
        throw new BizException(BizCode.PARAM_INVALID, parsed.error.issues[0]?.message);
    }

    const aiService = new AiService();

    reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });

    let aborted = false;
    request.raw.on("close", () => {
        aborted = true;
    });

    await aiService.chat({
        data: parsed.data, callback: {
            onAbort: (abort) => {
                request.raw.on("close", abort)
            },
            onMessage: (message) => {
                if (aborted) {
                    return;
                }
                reply.raw.write(`data: ${JSON.stringify(message)}\n\n`);
            }
        }
    });

    reply.raw.end();
}