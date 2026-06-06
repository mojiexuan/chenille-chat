import { db, agents, models, modelProviders } from "@/db";
import { eq } from "drizzle-orm";
import { AgentKey } from "@/enumeration";
import { agentSafeVo } from "@/vo";
import { asc } from "drizzle-orm";

/**
 * 智能体服务
 */
class AgentService {
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

    /**
     * 获取Ai 聊天默认模型的智能体
     */
    async getAiChatDefaultModelAgent(modelId?: number) {
        if (modelId) {
            const [result] = await db
                .select({
                    model: models,
                    provider: modelProviders,
                })
                .from(models)
                .innerJoin(modelProviders, eq(models.providerId, modelProviders.id))
                .where(eq(models.id, modelId))
                .limit(1);
            if (result) {
                return result;
            }
        }
        const [result] = await db
            .select({
                agent: agents,
                model: models,
                provider: modelProviders,
            })
            .from(agents)
            .innerJoin(models, eq(agents.modelId, models.id))
            .innerJoin(modelProviders, eq(models.providerId, modelProviders.id))
            .where(eq(agents.key, AgentKey.AiChatDefaultModel))
            .limit(1);
        return result ?? null;
    }

    /**
     * 获取智能体列表
     */
    async getAgentList() {
        return db.select(agentSafeVo)
            .from(agents)
            .leftJoin(models, eq(agents.modelId, models.id))
            .orderBy(asc(agents.id));
    }
}

export const agentService = new AgentService();
