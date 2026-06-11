import { users, userSettings } from "@/db";

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
