import z from "zod/v4";

/**
 * 发送手机号验证码DTO
 */
export const sendPhoneCodeDto = z.object({
    phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
})

/**
 * 手机号认证DTO
 */
export const phoneCodeAuthDto = z.object({
    phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
    code: z.string().length(6, "验证码为6位数字"),
});

export type SendPhoneCodeDto = z.infer<typeof sendPhoneCodeDto>;
export type PhoneCodeAuthDto = z.infer<typeof phoneCodeAuthDto>;
