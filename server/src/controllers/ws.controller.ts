import type { FastifyRequest, FastifyReply } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import { wsService } from "@/services";
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
    const { redis } = request.server;
    const ticket = await wsService.init(redis).generateTicket(userId);
    return reply.success(ticket, "Ticket 生成成功");
}

/**
 * WebSocket 处理函数
 */
export async function webSocketHandler(
    socket: WebSocket,
    request: FastifyRequest,
) {
    const ticket = new URLSearchParams(request.url.split("?")[1] || "").get("ticket");

    if (!ticket) {
        socket.close(4001, "缺少 ticket");
        return;
    }

    const userId = await wsService.validateTicket(ticket);
    if (!userId) {
        socket.close(4001, "ticket 无效或已过期");
        return;
    }

    wsService.handleConnection(socket, userId);
}