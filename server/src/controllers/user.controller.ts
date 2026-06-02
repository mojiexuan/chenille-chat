import type { FastifyRequest, FastifyReply } from "fastify";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { UserService } from "@/services";

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
  const userService = new UserService();
  const user = await userService.getUserInfoById(userId);
  if (!user) {
    throw new BizException(BizCode.AUTH_NOT_FOUND);
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
  const userService = new UserService();
  const avatar = await userService.updateAvatar(userId, file);
  return reply.success(avatar, "用户头像更新成功");
}
