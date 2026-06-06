import { models, modelProviders } from "@/db";

/**
 * 模型VO
 */
export const modelSafeVo = {
  id: models.id,
  providerId: models.providerId,
  name: models.name,
  description: models.description,
  canThinking: models.canThinking,
  canInputImage: models.canInputImage,
  canOutputImage: models.canOutputImage,
  canInputVideo: models.canInputVideo,
  canOutputVideo: models.canOutputVideo,
  canInputAudio: models.canInputAudio,
  canOutputAudio: models.canOutputAudio,
  isActive: models.isActive,
  isDefault: models.isDefault,
  sortOrder: models.sortOrder,
};

/**
 * 模型提供方VO
 */
export const modelProviderVo = {
  id: modelProviders.id,
  provider: modelProviders.provider,
  name: modelProviders.name,
  apiKey: modelProviders.apiKey,
  baseUrl: modelProviders.baseUrl,
  isActive: modelProviders.isActive,
};
