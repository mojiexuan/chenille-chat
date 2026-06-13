import z from "zod/v4";

export const chatSseDto = z.object({
  message: z.string().trim().min(1, "消息不能为空"),
  sessionId: z.coerce.number().optional(),
  // provider: z.enum(["openai", "google", "anthropic"]).optional(),
  modelId: z.coerce.number().optional(),
  workSpace: z.string().min(1, "工作空间不能为空").max(500, "工作空间最多500个字符").optional(),
});

export type ChatSseDto = z.infer<typeof chatSseDto>;

/**
 * 动词指示器
 */
export const chatGerundIndicatorDto = z.object({
  content: z.string().trim().min(1, "内容不能为空"),
});

export type ChatGerundIndicatorDto = z.infer<typeof chatGerundIndicatorDto>;
