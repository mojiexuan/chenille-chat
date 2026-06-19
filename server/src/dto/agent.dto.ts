import z from "zod/v4";

export const agentIdDto = z.object({
    agentId: z.string().trim().min(1, "智能体ID不能为空"),
});

/**
 * 智能体添加或更新参数
 */
export const agentAddOrUpdateDto = z.object({
    id: z.string().trim().min(1, "ID不能为空").optional(),
    name: z.string().trim().min(1, "请输入智能体名称").max(50, "智能体名称最多50个字符").optional(),
    description: z.string().trim().min(1, "请输入智能体描述").max(260, "智能体描述最多260个字符").optional(),
    modelId: z.string().trim().min(1, "模型ID不能为空").optional(),
});

export type AgentIdDto = z.infer<typeof agentIdDto>;
export type AgentAddOrUpdateDto = z.infer<typeof agentAddOrUpdateDto>;
