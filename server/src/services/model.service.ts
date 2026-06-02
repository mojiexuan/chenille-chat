import { db, models } from "@/db";
import { desc, eq } from "drizzle-orm";
import { modelSafeVo } from "@/vo";

export class ModelService {
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
}
