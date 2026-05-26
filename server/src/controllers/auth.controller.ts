import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SmsService, AuthService } from "@/services";

/**
 * 发送手机号验证码
 * @param request 请求
 * @param reply 响应
 */
export async function sendPhoneCodeHandler(request: FastifyRequest, reply: FastifyReply) {
    const { redis } = request.server;
    const authService = new AuthService(redis, new SmsService());
}

/**
 * 手机号验证码登录
 * @param request 请求
 * @param reply 响应
 */
export async function phoneCodeLoginHandler(request: FastifyRequest, reply: FastifyReply) {
}