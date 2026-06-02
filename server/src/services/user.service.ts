import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { userSafeInfo } from "@/vo";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { OssService } from "./oss.service";
import { logger } from "@/utils";
import type { MultipartFile } from "@fastify/multipart";

/**
 * 用户服务
 */
export class UserService {
  private ossService: OssService;

  constructor() {
    this.ossService = new OssService();
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
    return user;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId: number) {}

  /**
   * 更新用户头像
   */
  async updateAvatar(userId: number, avatar: MultipartFile) {
    const avatarUrl = await this.ossService.uploadFileToOss(avatar);
    try {
      await db
        .update(users)
        .set({ avatar: avatarUrl })
        .where(eq(users.id, userId));
      return avatarUrl;
    } catch (err) {
      logger.error(err, "更新用户头像失败");
      this.ossService.deleteFileFromOss(avatarUrl);
      throw new BizException(BizCode.USER_UPDATE_FAIL);
    }
  }

  /**
   * 绑定微信账号
   */
  async bindWeChat() {}
}
