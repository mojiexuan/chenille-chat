import z from "zod/v4";
import { UserGender } from "@/enumeration";
import { sanitizeUserText } from "@/utils";

/**
 * 发送手机号验证码DTO
 */
export const meUpdateUserInfoDto = z.object({
  nickname: z.string().trim().max(20, "昵称最多20个字符").transform((v)=>{
    return sanitizeUserText(v, { replaceHtmlAndPathChars: true });
  }).optional(),
  gender: z.enum(UserGender).optional(),
});

export type MeUpdateUserInfoDto = z.infer<typeof meUpdateUserInfoDto>;

/**
 * 更新用户设置DTO
 */
export const meUserSettingsDto = z.object({
  isLocationEnabled: z.boolean().optional(),
});

export type MeUserSettingsDto = z.infer<typeof meUserSettingsDto>;
