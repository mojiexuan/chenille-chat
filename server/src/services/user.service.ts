import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { userSafeInfo } from "@/vo";

/**
 * 用户服务
 */
export class UserService {

    /**
     * 根据用户ID获取用户信息
     */
    async getUserInfoById(userId: number) {
        const [user] = await db.select(userSafeInfo).from(users).where(eq(users.id, userId)).limit(1);
        return user || null;
    }

    /**
     * 更新用户信息
     */
    async updateProfile(userId: number) { }

    /**
     * 绑定微信账号
     */
    async bindWeChat() { }
}