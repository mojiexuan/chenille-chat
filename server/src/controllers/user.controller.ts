import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * 获取用户信息
 * @param request 请求
 * @param reply 响应
 */
export async function meInfoHandler(request: FastifyRequest, reply: FastifyReply) {
    return reply.success(null, "用户信息");
}