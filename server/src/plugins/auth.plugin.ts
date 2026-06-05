import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { config } from "@/config";
import { BizException } from "@/exception";
import { BizCode, UserStatus } from "@/enumeration";
import type { JwtPayload } from "@/types/jwt.type";
import { userService } from "@/services";

/**
 * 验证JWT
 */
export async function verifyJwt(request: FastifyRequest) {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new BizException(BizCode.AUTH_UNAUTHORIZED);
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    const user = await userService.getUserInfoById(payload.userId);
    if (!user) {
      throw new BizException(BizCode.USER_NOT_FOUND);
    }
    if (user.status === UserStatus.Frozen) {
      throw new BizException(BizCode.USER_FROZEN);
    }
    if (user.status === UserStatus.Disabled) {
      throw new BizException(BizCode.USER_DISABLED);
    }
    request.userId = payload.userId;
    request.userRole = user.role;
  } catch {
    throw new BizException(BizCode.AUTH_EXPIRED);
  }
}
