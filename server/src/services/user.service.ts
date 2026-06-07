import { db, users, loginLogs, aiTokenUsages } from "@/db";
import { eq, desc, sum } from "drizzle-orm";
import { userSafeInfo } from "@/vo";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { ossService } from "@/services";
import { logger, formatNumber } from "@/utils";
import type { MultipartFile } from "@fastify/multipart";
import { MeUpdateUserInfoDto } from "@/dto";

/**
 * 用户服务
 */
class UserService {

  constructor() {
  }

  /**
   * 根据用户ID获取用户信息
   */
  async getUserInfoById(userId: number) {
    const [user] = await db
      .select(userSafeInfo)
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new BizException(BizCode.USER_NOT_FOUND);
    }
    user.avatar = ossService.getFullUrl(user.avatar);
    return user;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: number, data: MeUpdateUserInfoDto) {
    const set: Record<string, unknown> = {};
    if (data.nickname !== undefined) {
      set.nickname = data.nickname;
    }
    if (data.gender !== undefined) {
      set.gender = data.gender;
    }
    if (Object.keys(set).length === 0) {
      return;
    }
    await db.update(users).set(set).where(eq(users.id, userId));
    return set;
  }

  /**
   * 更新用户头像
   */
  async updateAvatar(userId: number, avatar: MultipartFile) {
    const user = await this.getUserInfoById(userId);
    ossService.deleteFileFromOss(user.avatar);
    const { url, path } = await ossService.uploadFileToOss(avatar);
    try {
      await db.update(users).set({ avatar: path }).where(eq(users.id, userId));
      return url;
    } catch (err) {
      logger.error(err, "更新用户头像失败");
      ossService.deleteFileFromOss(path);
      throw new BizException(BizCode.USER_UPDATE_FAIL);
    }
  }

  /**
   * 获取用户最新登录日志
   */
  async getNewLoginLog(userId: number) {
    const [loginLog] = await db
      .select()
      .from(loginLogs)
      .where(eq(loginLogs.userId, userId))
      .orderBy(desc(loginLogs.createdAt))
      .limit(1);
    return loginLog;
  }

  /**
   * 绑定微信账号
   */
  async bindWeChat() { }

  /**
   * 获取用户使用AI令牌
   */
  async getUserUsageAiToken(userId: number) {
    const [row] = await db
      .select({
        totalTokens: sum(aiTokenUsages.totalTokens),
        cachedTokens: sum(aiTokenUsages.cachedTokens)
      })
      .from(aiTokenUsages)
      .where(eq(aiTokenUsages.userId, userId));
    const total = Number(row.totalTokens) || 0;
    const cached = Number(row.cachedTokens) || 0;
    const hitRate = total > 0 ? Number((cached / total) * 100).toFixed(2) : 0;
    return {
      totalTokens: formatNumber(total),
      cachedTokens: formatNumber(cached),
      cacheHitRate: hitRate
    };
  }
}

export const userService = new UserService();
