import { AiProvider, ReasoningEffort } from "@/enumeration";
import z from "zod/v4";

/**
 * 模型提供方ID参数
 */
export const providerIdDto = z.object({
  providerId: z.string().trim().min(1, "提供者ID不能为空"),
});

/**
 * 模型提供方添加或更新参数
 */
export const modelProviderAddOrUpdateDto = z.object({
  id: z.string().trim().min(1, "ID不能为空").optional(),
  provider: z.enum(AiProvider).optional(),
  name: z.string().trim().min(1, "名称不能为空").max(30, "名称不能超过30个字符").optional(),
  apiKey: z.string().trim().min(1, "API Key不能为空").max(260, "API Key不能超过260个字符").optional(),
  baseUrl: z.string().trim().min(1, "Base URL不能为空").max(260, "Base URL不能超过260个字符").optional(),
  isActive: z.boolean().optional(),
});

/**
 * 模型ID参数
 */
export const modelIdDto = z.object({
  modelId: z.string().trim().min(1, "模型ID不能为空"),
});

/**
 * 模型添加或更新参数
 */
export const modelAddOrUpdateDto = z.object({
  id: z.string().trim().min(1, "ID不能为空").optional(),
  providerId: z.string().trim().min(1, "提供者ID不能为空").optional(),
  name: z.string().trim().min(1, "名称不能为空").max(30, "名称不能超过30个字符").optional(),
  modelName: z.string().trim().min(1, "模型名称不能为空").max(100, "模型名称不能超过100个字符").optional(),
  description: z.string().trim().min(1, "描述不能为空").max(260, "描述不能超过260个字符").optional(),
  reasoningEffort: z.enum(ReasoningEffort).optional(),
  canInputText: z.boolean().optional(),
  canOutputText: z.boolean().optional(),
  canInputAudio: z.boolean().optional(),
  canOutputAudio: z.boolean().optional(),
  canInputImage: z.boolean().optional(),
  canOutputImage: z.boolean().optional(),
  canInputVideo: z.boolean().optional(),
  canOutputVideo: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100).optional(),
});

export type ProviderIdDto = z.infer<typeof providerIdDto>;
export type ModelProviderAddOrUpdateDto = z.infer<typeof modelProviderAddOrUpdateDto>;
export type ModelIdDto = z.infer<typeof modelIdDto>;
export type ModelAddOrUpdateDto = z.infer<typeof modelAddOrUpdateDto>;
