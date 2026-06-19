import { db, agents, models, modelProviders } from "@/db";
import { eq } from "drizzle-orm";
import { AgentKey } from "@/enumeration";
import { agentSafeVo } from "@/vo";
import { AgentAddOrUpdateDto } from "@/dto";
import { asc } from "drizzle-orm";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 智能体服务
 */
class AgentService {
  constructor() { }

  /**
   * 获取智能体详情
   */
  async getAgent(key: AgentKey) {
    const [result] = await db
      .select({
        agent: agents,
        model: models,
        provider: modelProviders,
      })
      .from(agents)
      .innerJoin(models, eq(agents.modelId, models.id))
      .innerJoin(modelProviders, eq(models.providerId, modelProviders.id))
      .where(eq(agents.key, key))
      .limit(1);
    return result ?? null;
  }

  /**
   * 获取语音识别智能体
   */
  async getAsrRecognitionAgent() {
    return await this.getAgent(AgentKey.AsrRecognition);
  }

  /**
   * 获取加载指示器的智能体
   */
  async getGerundIndicatorAgent() {
    return await this.getAgent(AgentKey.GenerateGerundIndicator);
  }

  /**
   * 获取生成会话标题的智能体
   */
  async getGenerateSessionTitleAgent() {
    return await this.getAgent(AgentKey.GenerateSessionTitle);
  }

  /**
   * 获取Ai 聊天默认模型的智能体
   */
  async getAiChatDefaultModelAgent(modelId?: string) {
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
    return await this.getAgent(AgentKey.AiChatDefaultModel);
  }

  /**
   * 获取智能体列表
   */
  async getAgentList() {
    return db
      .select(agentSafeVo)
      .from(agents)
      .leftJoin(models, eq(agents.modelId, models.id))
      .orderBy(asc(agents.id));
  }

  /**
   * 添加或更新智能体
   */
  async addOrUpdateAgent(agent: AgentAddOrUpdateDto) {
    const set: Partial<typeof agents.$inferInsert> = {};
    if (agent.modelId) {
      const [model] = await db
        .select({ id: models.id })
        .from(models)
        .where(eq(models.id, agent.modelId))
        .limit(1);
      if (!model) {
        throw new BizException(BizCode.MODEL_NOT_FOUND);
      }
      set.modelId = model.id;
    }
    if (agent.name) {
      set.name = agent.name;
    }
    if (agent.description) {
      set.description = agent.description;
    }
    if (agent.id) {
      await db.update(agents).set(set).where(eq(agents.id, agent.id));
      return;
    }
    await db.insert(agents).values(set as typeof agents.$inferInsert);
  }

  /**
   * 删除智能体
   */
  async deleteAgent(agentId: string) {
    await db.delete(agents).where(eq(agents.id, agentId));
  }

}

export const agentService = new AgentService();
