import type { FastifyRequest, FastifyReply } from "fastify";
import { agentService } from "@/services";

/**
 * 获取智能体列表
 */
export async function getAgentListHandler(request: FastifyRequest, reply: FastifyReply,) {
    const agentList = await agentService.getAgentList();
    return reply.success(agentList, "获取智能体列表成功");
}