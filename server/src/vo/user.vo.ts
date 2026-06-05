import { users } from "@/db";

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
