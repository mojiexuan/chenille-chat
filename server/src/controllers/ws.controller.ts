import type { FastifyRequest, FastifyReply } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * WebSocket Ticket 处理函数
 */
export async function getWebSocketTicketHandler(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const userId = request.userId;
    if (!userId) {
        throw new BizException(BizCode.AUTH_UNAUTHORIZED);
    }
}

/**
 * WebSocket 处理函数
 */
export async function webSocketHandler(
    socket: WebSocket,
    request: FastifyRequest,
) { }