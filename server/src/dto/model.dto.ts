import { AiProvider } from "@/enumeration";
import z from "zod/v4";

/**
 * 模型提供方ID参数
 */
export const modelByProviderIdDto = z.object({
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

export type ModelByProviderIdDto = z.infer<typeof modelByProviderIdDto>;
export type ModelProviderAddOrUpdateDto = z.infer<typeof modelProviderAddOrUpdateDto>;
