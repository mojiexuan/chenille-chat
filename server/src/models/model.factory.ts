import { ChatModel } from "@/types";
import { OpenAiModel } from "./openai";
import { GoogleModel } from "./google";
import { AnthropicModel } from "./anthropic";
import { AiProvider } from "@/enumeration";
import { AiModel } from "./base.model";

/**
 * 创建AI模型
 * @param model 聊天模型
 * @returns AI模型
 */
export function createAiModel(model: ChatModel): AiModel {
    switch (model.provider) {
        case AiProvider.DeepSeek:
        case AiProvider.OpenAI:
            return new OpenAiModel(model);
        case AiProvider.Google:
            return new GoogleModel(model);
        case AiProvider.Anthropic:
            return new AnthropicModel(model);
        default:
            throw new Error(`未知的AI提供方: ${model.provider}`);
    }
}