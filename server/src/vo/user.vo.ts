import { users } from "@/db";

export const userSafeInfo = {
    id: users.id,
    username: users.username,
    email: users.email,
    phone: users.phone,
    gender: users.gender,
    avatar: users.avatar,
} as const;