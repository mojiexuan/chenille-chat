import type { FastifyInstance } from "fastify";
import { webSocketHandler } from "@/controllers";

/**
 * WebSocket 路由
 */
export async function wsRouter(fastify: FastifyInstance) {
    // 全系统唯一连接入口，通过 action 分发业务
    fastify.get("/connect", { websocket: true }, webSocketHandler);
}