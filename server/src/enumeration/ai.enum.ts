import { pgEnum } from "drizzle-orm/pg-core";

export enum AIProvider {
    DeepSeek = "deepseek",
    OpenAI = "openai",
    Google = "google",
    Anthropic = "anthropic",
}

/**
 * 模型供应商枚举
 */
export const modelProviderEnum = pgEnum(
    "model_provider",
    Object.values(AIProvider) as [string, ...string[]],
);