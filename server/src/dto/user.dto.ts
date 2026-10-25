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

/**
 * 更新用户助手配置DTO
 */
export const meUserAgentProfileDto = z.object({
  agentNickname: z.string().trim().max(20, "助手昵称最多20个字符").transform((v)=>{
    return sanitizeUserText(v, { replaceHtmlAndPathChars: true });
  }).optional(),
  userAlias: z.string().trim().max(20, "用户别名最多20个字符").transform((v)=>{
    return sanitizeUserText(v, { replaceHtmlAndPathChars: true });
  }).optional(),
  personaPrompt: z.string().trim().optional(),
}).refine((data) => {
  if (data.personaPrompt && data.personaPrompt.length > 2000) {
    throw new Error("个人描述最多2000个字符");
  }
  return true;
});

export type MeUserAgentProfileDto = z.infer<typeof meUserAgentProfileDto>;
