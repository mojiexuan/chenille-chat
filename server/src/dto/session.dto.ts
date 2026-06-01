import z from "zod/v4";

export const sessionTitleRequestDto = z.object({
    sessionId: z.coerce.number().min(0,"空会话ID"),
});

export type SessionTitleRequestDto = z.infer<typeof sessionTitleRequestDto>;