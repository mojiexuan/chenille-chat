import { db, models, modelProviders } from "@/db";
import { desc, eq } from "drizzle-orm";
import { modelSafeVo, modelProviderVo } from "@/vo";
import { ModelProviderAddOrUpdateDto, ModelAddOrUpdateDto } from "@/dto";
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
      .orderBy(desc(models.sortOrder));
  }

  /**
   * 获取所有活跃模型列表
   */
  async getActiveModelList() {
    return await db
      .select(modelSafeVo)
      .from(models)
      .where(eq(models.isActive, true))
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

  /**
   * 添加或更新模型
   */
  async addOrUpdateModel(data: ModelAddOrUpdateDto) {
    const set: Partial<typeof models.$inferInsert> = {};
    if (data.providerId) {
      const [provider] = await db
        .select({ id: modelProviders.id })
        .from(modelProviders)
        .where(eq(modelProviders.id, data.providerId))
        .limit(1);
      if (!provider) {
        throw new BizException(BizCode.MODEL_PROVIDER_NOT_FOUND);
      }
      set.providerId = data.providerId;
    }
    if (data.name) {
      set.name = data.name;
    }
    if (data.modelName) {
      set.modelName = data.modelName;
    }
    if (data.description) {
      set.description = data.description;
    }
    if (data.reasoningEffort) {
      set.reasoningEffort = data.reasoningEffort;
    }
    if (data.canInputText !== void 0) {
      set.canInputText = data.canInputText;
    }
    if (data.canOutputText !== void 0) {
      set.canOutputText = data.canOutputText;
    }
    if (data.canInputImage !== void 0) {
      set.canInputImage = data.canInputImage;
    }
    if (data.canOutputImage !== void 0) {
      set.canOutputImage = data.canOutputImage;
    }
    if (data.canInputVideo !== void 0) {
      set.canInputVideo = data.canInputVideo;
    }
    if (data.canOutputVideo !== void 0) {
      set.canOutputVideo = data.canOutputVideo;
    }
    if (data.canInputAudio !== void 0) {
      set.canInputAudio = data.canInputAudio;
    }
    if (data.canOutputAudio !== void 0) {
      set.canOutputAudio = data.canOutputAudio;
    }
    if (data.isDefault !== void 0) {
      set.isDefault = data.isDefault;
    }
    if (data.sortOrder !== void 0) {
      set.sortOrder = data.sortOrder;
    }
    if (data.isActive !== void 0) {
      set.isActive = data.isActive;
    }
    if (Object.keys(set).length === 0) {
      return;
    }
    if (data.id) {
      await db.update(models).set(set).where(eq(models.id, data.id));
      return;
    }
    await db.insert(models).values(set as typeof models.$inferInsert);
  }

  /**
   * 删除模型
   */
  async deleteModel(modelId: string) {
    await db.delete(models).where(eq(models.id, modelId));
  }

}

export const modelService = new ModelService();
