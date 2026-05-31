import type { FastifyRequest, FastifyReply } from "fastify";
import { chatSseDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode, SseEventName } from "@/enumeration";
import { AiService } from "@/services";
import type { SseEventChunk } from "@/types";

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
        data: parsed.data, userId: request.userId!, callback: {
            onAbort: (abort) => {
                request.raw.on("close", abort)
            },
            onMessage: (message) => {
                if (aborted) {
                    return;
                }
                sseSend(reply, {
                    event: SseEventName.AI_CHAT_MESSAGE,
                    data: message,
                });
            },
            onTitle: (sessionId, title) => {
                if (aborted) {
                    return;
                }
                sseSend(reply, {
                    event: SseEventName.AI_CHAT_SESSION_TITLE,
                    data: {
                        sessionId,
                        title,
                    },
                });
            }
        }
    });

    reply.raw.end();
}

/**
 * 发送 SSE 事件
 * @param reply 响应
 * @param data 事件数据
 */
function sseSend(reply: FastifyReply, data: SseEventChunk) {
    reply.raw.write(`event: ${data.event}\ndata: ${JSON.stringify(data.data)}\n\n`);
}