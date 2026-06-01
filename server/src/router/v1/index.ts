import type { FastifyInstance } from "fastify";
import {
    sendPhoneCodeHandler,
    phoneCodeLoginHandler,
    meInfoHandler,
    chatSseHandler,
    getSessionListHandler,
    getSessionTitleHandler,
} from "@/controllers";
import { verifyJwt } from "@/plugins/auth.plugin";

export async function v1Router(fastify: FastifyInstance) {
    fastify.post("/auth/phone/code", sendPhoneCodeHandler);
    fastify.post("/auth/phone/login", phoneCodeLoginHandler);
    // 需要登录才能访问的接口
    fastify.register(async (protectedScope) => {
        protectedScope.addHook("preHandler", verifyJwt);
        protectedScope.get("/user/me", meInfoHandler);
        protectedScope.post("/chat/sse", chatSseHandler);
        protectedScope.get("/chat/session/list", getSessionListHandler);
        protectedScope.get("/chat/session/:sessionId/title", getSessionTitleHandler);
    });
}
