import { pgEnum } from "drizzle-orm/pg-core";

/**
 * 模型供应商枚举
 */
export enum AIProvider {
  DeepSeek = "deepseek",
  OpenAI = "openai",
  Google = "google",
  Anthropic = "anthropic",
}

/**
 * 模型分类枚举
 */
export enum ModelClassification {
  Low = "low",
  Medium = "medium",
  High = "high",
}

/**
 * 模型供应商枚举
 */
export const modelProviderEnum = pgEnum(
  "model_provider",
  Object.values(AIProvider) as [string, ...string[]],
);

/**
 * 模型分类枚举
 */
export const modelClassification = pgEnum(
  "model_classification",
  Object.values(ModelClassification) as [string, ...string[]],
);
