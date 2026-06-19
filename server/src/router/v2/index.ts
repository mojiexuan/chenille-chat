import type { FastifyInstance } from "fastify";
import { verifyJwt, requireRole } from "@/plugins";
import { UserRole } from "@/enumeration";

export async function v2Router(fastify: FastifyInstance) {
    // 不需要登录就能访问的接口

    // 需要登录才能访问的接口
    fastify.register(async (authScope) => {
        authScope.addHook("preHandler", verifyJwt);
        // 普通用户及以上
        authScope.register(async (scope) => {
            scope.addHook("preHandler", requireRole(UserRole.User, UserRole.Admin));
        });
        // 管理员用户
        authScope.register(async (adminScope) => {
            adminScope.addHook("preHandler", requireRole(UserRole.Admin));
        });
    });
}
