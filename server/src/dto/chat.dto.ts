import z from "zod/v4";
import { sanitizeUserText } from "@/utils";

export const chatSseDto = z.object({
  message: z.string().trim().min(1, "消息不能为空"),
  /** 会话附件URL列表 */
  attachments: z.array(z.object({
    name: z.string().trim().min(1, "文件名不能为空").max(250, "文件名最多250个字符").transform((v)=>{
      return sanitizeUserText(v, { replaceHtmlAndPathChars: true });
    }),
    url: z.string().trim().min(1, "文件URL不能为空").max(500, "文件URL最多500个字符"),
  })).optional(),
  /** 会话ID */
  sessionId: z.string().trim().min(1, "会话ID不能为空").optional(),
  modelId: z.string().trim().min(1, "模型ID不能为空").optional(),
  workSpace: z
    .string()
    .min(1, "工作空间不能为空")
    .max(500, "工作空间最多500个字符")
    .optional(),
});

export type ChatSseDto = z.infer<typeof chatSseDto>;

/**
 * 动词指示器
 */
export const chatGerundIndicatorDto = z.object({
  content: z.string().trim().min(1, "内容不能为空"),
});

export type ChatGerundIndicatorDto = z.infer<typeof chatGerundIndicatorDto>;
