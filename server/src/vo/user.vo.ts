import { users, userSettings, userAgentProfiles } from "@/db";

export const userSafeInfo = {
  username: users.username,
  nickname: users.nickname,
  email: users.email,
  phone: users.phone,
  gender: users.gender,
  avatar: users.avatar,
  role: users.role,
  status: users.status,
};

/**
 * 用户设置信息
 */
export const userSettingsInfo = {
  isLocationEnabled: userSettings.isLocationEnabled,
};

/**
 * 用户助手配置信息
 */
export const userAgentProfileInfo = {
  agentNickname: userAgentProfiles.agentNickname,
  userAlias: userAgentProfiles.userAlias,
  personaPrompt: userAgentProfiles.personaPrompt,
};
