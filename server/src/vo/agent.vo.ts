import { agents, models } from "@/db";

/**
 * 代理VO
 */
export const agentSafeVo = {
    id: agents.id,
    name: agents.name,
    key: agents.key,
    description: agents.description,
    modelId: agents.modelId,
    model: {
        name: models.name,
    }
}