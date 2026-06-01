import z from "zod/v4";

/**
 * 会话标题请求DTO
 */
export const sessionTitleRequestDto = z.object({
    sessionId: z.coerce.number().min(0, "空会话ID"),
});

/**
 * 会话请求DTO
 */
export const sessionRequestDto = z.object({
    sessionId: z.coerce.number().min(0, "空会话ID"),
});

export type SessionTitleRequestDto = z.infer<typeof sessionTitleRequestDto>;
export type SessionRequestDto = z.infer<typeof sessionRequestDto>;