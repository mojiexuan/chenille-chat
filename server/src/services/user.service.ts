import { db, users, loginLogs, aiTokenUsages, userSettings } from "@/db";
import { eq, desc, sum } from "drizzle-orm";
import { userSafeInfo, userSettingsInfo } from "@/vo";
import { BizException } from "@/exception";
import { BizCode, UserRole } from "@/enumeration";
import { ossService } from "@/services";
import { logger, formatNumber,convertFileToMemoryFile,validateFile } from "@/utils";
import type { MultipartFile } from "@fastify/multipart";
import { MeUpdateUserInfoDto, MeUserSettingsDto } from "@/dto";
import { USER_AVATAR_IMAGE_TYPES } from "@/constants";

/**
 * 用户服务
 */
class UserService {
  constructor() { }

  /**
   * 根据用户ID获取用户信息
   */
  async getUserInfoById(userId: string) {
    const [user] = await db
      .select(userSafeInfo)
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new BizException(BizCode.USER_NOT_FOUND);
    }
    user.avatar = user.avatar ? ossService.getFullUrl(user.avatar) : null;
    return user;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: string, data: MeUpdateUserInfoDto) {
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
   * 更新用户角色
   */
  async updateUserRole(userId: string, role: UserRole) {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, userId)).returning();
    return user;
  }

  /**
   * 更新用户头像
   */
  async updateAvatar(userId: string, avatar: MultipartFile) {
    // 获取用户信息
    const user = await this.getUserInfoById(userId);
    // 转换文件
    const memoryFile = await convertFileToMemoryFile(avatar);
    // 校验文件类型 + 大小是否在允许的范围内
    validateFile(memoryFile,USER_AVATAR_IMAGE_TYPES,10 * 1024 * 1024);
    // 删除旧的头像文件
    ossService.deleteFileFromOss(user.avatar);
    // 上传新头像
    const { url, path } = await ossService.uploadFileToOssWithBuffer(memoryFile);
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
  async getNewLoginLog(userId: string) {
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
  async getUserUsageAiToken(userId: string) {
    const [row] = await db
      .select({
        totalTokens: sum(aiTokenUsages.totalTokens),
        cachedTokens: sum(aiTokenUsages.cachedTokens),
      })
      .from(aiTokenUsages)
      .where(eq(aiTokenUsages.userId, userId));
    const total = Number(row.totalTokens) || 0;
    const cached = Number(row.cachedTokens) || 0;
    const hitRate = total > 0 ? Number((cached / total) * 100).toFixed(2) : 0;
    return {
      totalTokens: formatNumber(total),
      cachedTokens: formatNumber(cached),
      cacheHitRate: hitRate,
    };
  }

  /**
   * 获取用户设置信息
   * @param userId 用户ID
   * @returns 用户设置信息
   */
  async getUserSetting(userId: string) {
    let [row] = await db
      .select(userSettingsInfo)
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    if (!row) {
      row = {
        isLocationEnabled: false,
      };
    }
    return row;
  }

  /**
   * 更新用户设置
   */
  async updateUserSettings(userId: string, data: MeUserSettingsDto) {
    const set: Record<string, unknown> = {};
    if (data.isLocationEnabled !== undefined) {
      set.isLocationEnabled = data.isLocationEnabled;
    }
    if (Object.keys(set).length === 0) {
      return;
    }
    const [row] = await db
      .insert(userSettings)
      .values({ userId, ...set })
      .onConflictDoUpdate({ target: userSettings.userId, set })
      .returning();
    return row;
  }
}

export const userService = new UserService();
