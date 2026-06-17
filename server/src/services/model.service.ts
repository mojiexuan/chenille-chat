import { db, models, modelProviders } from "@/db";
import { desc, eq } from "drizzle-orm";
import { modelSafeVo, modelProviderVo } from "@/vo";
import { ModelProviderAddOrUpdateDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

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
   * 获取所有活跃模型列表
   */
  async getActiveModelList() {
    return (await this.getModelList()).filter((item) => item.isActive === true);
  }

  /**
   * 根据提供提供方ID获取模型列表
   */
  async getModelListByProviderId(providerId: string) {
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

  /**
   * 添加模型提供方
   */
  async addOrUpdateModelProvider(data: ModelProviderAddOrUpdateDto) {
    const set: Partial<typeof modelProviders.$inferInsert> = {};
    if (data.provider) {
      set.provider = data.provider;
    }
    if (data.name) {
      set.name = data.name;
    }
    if (data.apiKey) {
      set.apiKey = data.apiKey;
    }
    if (data.baseUrl) {
      set.baseUrl = data.baseUrl;
    }
    if (data.isActive !== undefined) {
      set.isActive = data.isActive;
    }
    if (Object.keys(set).length === 0) {
      return;
    }
    if (data.id) {
      await db.update(modelProviders).set(set).where(eq(modelProviders.id, data.id));
      return;
    }
    await db.insert(modelProviders).values(set as typeof modelProviders.$inferInsert);
  }

  /**
   * 删除模型提供方
   */
  async deleteModelProvider(providerId: string) {
    await db.delete(modelProviders).where(eq(modelProviders.id, providerId));
  }

}

export const modelService = new ModelService();
