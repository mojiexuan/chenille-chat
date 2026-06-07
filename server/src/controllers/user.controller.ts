import type { FastifyRequest, FastifyReply } from "fastify";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { userService } from "@/services";
import { meUpdateUserInfoDto } from "@/dto";

/**
 * 获取用户信息
 * @param request 请求
 * @param reply 响应
 */
export async function meGetInfoHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.userId;
  if (typeof userId !== "number") {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const user = await userService.getUserInfoById(userId);
  if (!user) {
    throw new BizException(BizCode.USER_NOT_FOUND);
  }
  return reply.success(user, "用户信息");
}

/**
 * 更新用户头像
 * @param request 请求
 * @param reply 响应
 */
export async function meUpdateAvatarHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.userId;
  if (typeof userId !== "number") {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const file = await request.file();
  if (!file) {
    throw new BizException(BizCode.PARAM_INVALID, "请上传文件");
  }
  const avatar = await userService.updateAvatar(userId, file);
  return reply.success(avatar, "用户头像更新成功");
}

/**
 * 更新用户信息
 * @param request 请求
 * @param reply 响应
 */
export async function meUpdateUserInfoHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = meUpdateUserInfoDto.safeParse(request.body);
  if (!parsed.success) {
    throw new BizException(
      BizCode.PARAM_INVALID,
      parsed.error.issues[0]?.message,
    );
  }
  const userId = request.userId;
  if (typeof userId !== "number") {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const set = await userService.updateProfile(userId, parsed.data);
  return reply.success(set, "用户信息更新成功");
}

/**
 * 用户使用AI令牌
 */
export async function meUsageAiTokenHandle(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.userId;
  if (typeof userId !== "number") {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }
  const usage = await userService.getUserUsageAiToken(userId);
  return reply.success(usage, "用户使用AI Token");
}
