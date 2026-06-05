import type { FastifyInstance } from "fastify";
import {
  sendPhoneCodeHandler,
  phoneCodeLoginHandler,
  meGetInfoHandler,
  chatSseHandler,
  getSessionListHandler,
  getSessionTitleHandler,
  getSessionHandler,
  meUpdateAvatarHandler,
  meUpdateUserInfoHandler,
  getModelListHandler,
} from "@/controllers";
import { verifyJwt, requireRole } from "@/plugins";
import { UserRole } from "@/enumeration";

export async function v1Router(fastify: FastifyInstance) {
  fastify.post("/auth/phone/code", sendPhoneCodeHandler);
  fastify.post("/auth/phone/login", phoneCodeLoginHandler);
  // 需要登录才能访问的接口
  fastify.register(async (authScope) => {
    authScope.addHook("preHandler", verifyJwt);
    // 普通用户及以上
    authScope.register(async (scope) => {
      scope.addHook("preHandler", requireRole(UserRole.User, UserRole.Admin));
      scope.get("/user/me", meGetInfoHandler);
      scope.post("/user/me/avatar", meUpdateAvatarHandler);
      scope.patch("/user/me/info", meUpdateUserInfoHandler);
      scope.post("/chat/sse", chatSseHandler);
      scope.get("/chat/session/list", getSessionListHandler);
      scope.get(
        "/chat/session/:sessionId/title",
        getSessionTitleHandler,
      );
      scope.get("/chat/session/:sessionId", getSessionHandler);
      scope.get("/chat/model/list", getModelListHandler);
    });
    // 管理员用户
    authScope.register(async (adminScope) => {
      adminScope.addHook("preHandler", requireRole(UserRole.Admin));
    });
  });
}
