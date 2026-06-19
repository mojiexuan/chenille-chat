import type { FastifyRequest, FastifyReply } from "fastify";
import { agentService } from "@/services";
import { agentAddOrUpdateDto, agentIdDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 获取智能体列表
 */
export async function getAgentListHandler(request: FastifyRequest, reply: FastifyReply,) {
    const agentList = await agentService.getAgentList();
    return reply.success(agentList, "获取智能体列表成功");
}

/**
 * 添加或更新智能体
 */
export async function addOrUpdateAgentHandler(request: FastifyRequest, reply: FastifyReply,) {
    const parsed = agentAddOrUpdateDto.safeParse(request.body);
    if (!parsed.success) {
        throw new BizException(
            BizCode.PARAM_INVALID,
            parsed.error.issues[0]?.message,
        );
    }
    await agentService.addOrUpdateAgent(parsed.data);
    return reply.success(null, "添加或更新智能体成功");
}

/**
 * 删除智能体
 */
export async function deleteAgentHandler(request: FastifyRequest, reply: FastifyReply,) {
    const parsed = agentIdDto.safeParse(request.params);
    if (!parsed.success) {
        throw new BizException(
            BizCode.PARAM_INVALID,
            parsed.error.issues[0]?.message,
        );
    }
    await agentService.deleteAgent(parsed.data.agentId);
    return reply.success(null, "删除智能体成功");
}