import z from "zod/v4";

export const chatSseDto = z.object({
    message: z.string().trim().min(1, "消息不能为空"),
    sessionId: z.number().optional(),
    // provider: z.enum(["openai", "google", "anthropic"]).optional(),
    model: z.string().optional(),
});

export type ChatSseDto = z.infer<typeof chatSseDto>;