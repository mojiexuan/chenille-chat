import type { FastifyRequest } from "fastify";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { UserRole } from "@/enumeration";

/**
 * 角色守卫
 * @param roles 允许访问的角色列表
 */
export function requireRole(...roles: UserRole[]) {
    return async (request: FastifyRequest) => {
        if (!request.userRole || !roles.includes(request.userRole)) {
            throw new BizException(BizCode.AUTH_FORBIDDEN);
        }
    }
}
