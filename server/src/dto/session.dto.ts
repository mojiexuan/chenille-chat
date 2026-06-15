import z from "zod/v4";

/**
 * 会话标题请求DTO
 */
export const sessionTitleRequestDto = z.object({
    sessionId: z.string().trim().min(1, "会话ID不能为空"),
});

/**
 * 会话请求DTO
 */
export const sessionRequestDto = z.object({
    sessionId: z.string().trim().min(1, "会话ID不能为空"),
});

/**
 * 更新会话请求DTO
 */
export const updateSessionRequestDto = z.object({
    title: z.string().min(1, "空标题").optional(),
    workSpace: z.string().min(1, "空工作空间").optional(),
});

export type SessionTitleRequestDto = z.infer<typeof sessionTitleRequestDto>;
export type SessionRequestDto = z.infer<typeof sessionRequestDto>;
export type UpdateSessionRequestDto = z.infer<typeof updateSessionRequestDto>;