import { db, agents, models, modelProviders } from "@/db";
import { eq } from "drizzle-orm";
import { AgentKey } from "@/enumeration";

/**
 * 智能体服务
 */
export class AgentService {
    constructor() { }

    /**
     * 获取生成会话标题的智能体
     */
    async getGenerateSessionTitleAgent() {
        const [result] = await db
            .select({
                agent: agents,
                model: models,
                provider: modelProviders,
            })
            .from(agents)
            .innerJoin(models, eq(agents.modelId, models.id))
            .innerJoin(modelProviders, eq(models.providerId, modelProviders.id))
            .where(eq(agents.key, AgentKey.GenerateSessionTitle))
            .limit(1);
        return result ?? null;
    }
}

export const agentService = new AgentService();
