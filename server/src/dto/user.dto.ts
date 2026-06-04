import z from "zod/v4";
import { UserGender } from "@/enumeration";

/**
 * 发送手机号验证码DTO
 */
export const meUpdateUserInfoDto = z.object({
  nickname: z.string().max(20, "昵称最多20个字符").optional(),
  gender: z.enum(UserGender).optional(),
});

export type MeUpdateUserInfoDto = z.infer<typeof meUpdateUserInfoDto>;
