import type { FastifyRequest, FastifyReply } from "fastify";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { UserService } from "@/services";

/**
 * 获取用户信息
 * @param request 请求
 * @param reply 响应
 */
export async function meInfoHandler(request: FastifyRequest, reply: FastifyReply) {
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