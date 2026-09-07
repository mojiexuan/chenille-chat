import type { FastifyInstance } from "fastify";
import {
  sendPhoneCodeHandler,
  phoneCodeLoginHandler,
  logoutHandler,
  meGetInfoHandler,
  meUpdateAvatarHandler,
  meUpdateUserInfoHandler,
  meUsageAiTokenHandle,
  meUserSettingsHandler,
  meUpdateUserSettingsHandler,
  chatAttachmentHandler,
  chatSseHandler,
  chatGerundIndicatorHandler,
  getSessionListHandler,
  getSessionTitleHandler,
  getSessionHandler,
  getModelProviderListHandler,
  addOrUpdateModelProviderHandler,
  deleteModelProviderHandler,
  getModelListHandler,
  getActiveModelListHandler,
  addOrUpdateModelHandler,
  deleteModelHandler,
  getAgentListHandler,
  addOrUpdateAgentHandler,
  // deleteAgentHandler,
  deleteSessionHandler,
  updateSessionHandler,
  asrRecognizeHandler,
  getWebSocketTicketHandler,
} from "@/controllers";
import { verifyJwt, requireRole } from "@/plugins";
import { UserRole } from "@/enumeration";

export async function v1Router(fastify: FastifyInstance) {
  fastify.post("/auth/phone/code", sendPhoneCodeHandler);
  fastify.post("/auth/phone/login", phoneCodeLoginHandler);
  fastify.post("/auth/logout", logoutHandler);
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
      scope.post("/chat/attachment", chatAttachmentHandler);
      scope.post("/chat/sse", chatSseHandler);
      scope.post("/chat/gerund", chatGerundIndicatorHandler);
      scope.get("/chat/sessions", getSessionListHandler);
      scope.get("/chat/session/:sessionId/title", getSessionTitleHandler);
      scope.patch("/chat/session/:sessionId", updateSessionHandler);
      scope.delete("/chat/session/:sessionId", deleteSessionHandler);
      scope.get("/chat/session/:sessionId", getSessionHandler);
      scope.get("/chat/models", getActiveModelListHandler);
      scope.post("/asr/recognize", asrRecognizeHandler);
      scope.get("/ws/ticket", getWebSocketTicketHandler);
    });
    // 管理员用户
    authScope.register(async (adminScope) => {
      adminScope.addHook("preHandler", requireRole(UserRole.Admin));
      adminScope.get(
        "/admin/providers",
        getModelProviderListHandler,
      );
      adminScope.get("/admin/agents", getAgentListHandler);
      adminScope.put("/admin/agent", addOrUpdateAgentHandler);
      adminScope.patch("/admin/agent", addOrUpdateAgentHandler);
      // adminScope.delete("/admin/agent/:agentId", deleteAgentHandler); 暂不需要支持删除智能体
      adminScope.put("/admin/provider", addOrUpdateModelProviderHandler);
      adminScope.patch("/admin/provider", addOrUpdateModelProviderHandler);
      adminScope.delete("/admin/provider/:providerId", deleteModelProviderHandler);
      adminScope.get(
        "/admin/models",
        getModelListHandler,
      );
      adminScope.put("/admin/model", addOrUpdateModelHandler);
      adminScope.patch("/admin/model", addOrUpdateModelHandler);
      adminScope.delete("/admin/model/:modelId", deleteModelHandler);
    });
  });
}
