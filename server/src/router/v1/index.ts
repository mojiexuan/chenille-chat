import type { FastifyInstance } from "fastify";
import {
  sendPhoneCodeHandler,
  phoneCodeLoginHandler,
  meGetInfoHandler,
  meUpdateAvatarHandler,
  meUpdateUserInfoHandler,
  meUsageAiTokenHandle,
  meUserSettingsHandler,
  meUpdateUserSettingsHandler,
  chatSseHandler,
  chatGerundIndicatorHandler,
  getSessionListHandler,
  getSessionTitleHandler,
  getSessionHandler,
  getModelListHandler,
  getModelProviderListHandler,
  getModelListByProviderIdHandler,
  getAgentListHandler,
  deleteSessionHandler,
  updateSessionHandler,
  asrRecognizeHandler,
  addOrUpdateModelProviderHandler,
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
      scope.get("/user/me/ai/token", meUsageAiTokenHandle);
      scope.get("/user/me/settings", meUserSettingsHandler);
      scope.patch("/user/me/settings", meUpdateUserSettingsHandler);
      scope.post("/chat/sse", chatSseHandler);
      scope.post("/chat/gerund", chatGerundIndicatorHandler);
      scope.get("/chat/session/list", getSessionListHandler);
      scope.get("/chat/session/:sessionId/title", getSessionTitleHandler);
      scope.patch("/chat/session/:sessionId", updateSessionHandler);
      scope.delete("/chat/session/:sessionId", deleteSessionHandler);
      scope.get("/chat/session/:sessionId", getSessionHandler);
      scope.get("/chat/model/list", getModelListHandler);
      scope.post("/asr/recognize", asrRecognizeHandler);
    });
    // 管理员用户
    authScope.register(async (adminScope) => {
      adminScope.addHook("preHandler", requireRole(UserRole.Admin));
      adminScope.get(
        "/admin/chat/model/provider/list",
        getModelProviderListHandler,
      );
      adminScope.get(
        "/admin/chat/model/:providerId/list",
        getModelListByProviderIdHandler,
      );
      adminScope.get("/admin/agent/list", getAgentListHandler);
      adminScope.put("/admin/provider", addOrUpdateModelProviderHandler);
      adminScope.patch("/admin/provider", addOrUpdateModelProviderHandler);
    });
  });
}
