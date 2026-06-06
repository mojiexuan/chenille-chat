import { db, models, modelProviders } from "@/db";
import { desc, eq } from "drizzle-orm";
import { modelSafeVo, modelProviderVo } from "@/vo";

class ModelService {
  /**
   * 获取模型列表，按排序顺序降序排序
   */
  async getModelList() {
    return await db
      .select(modelSafeVo)
      .from(models)
      .where(eq(models.isActive, true))
      .orderBy(desc(models.sortOrder));
  }

  /**
   * 根据提供提供方ID获取模型列表
   */
  async getModelListByProviderId(providerId: number) {
    return await db
      .select(modelSafeVo)
      .from(models)
      .where(eq(models.providerId, providerId))
      .orderBy(desc(models.sortOrder));
  }

  /**
   * 获取模型提供方列表
   */
  async getModelProviderList() {
    return await db
      .select(modelProviderVo)
      .from(modelProviders);
  }

}

export const modelService = new ModelService();
