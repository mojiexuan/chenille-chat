import type { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "@/services";
import { sendPhoneCodeDto, phoneCodeAuthDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

/**
 * 发送手机号验证码
 * @param request 请求
 * @param reply 响应
 */
export async function sendPhoneCodeHandler(request: FastifyRequest, reply: FastifyReply) {
    const { redis } = request.server;
    const parsed = sendPhoneCodeDto.safeParse(request.body);
    if (!parsed.success) {
        throw new BizException(BizCode.PARAM_INVALID, parsed.error.issues[0]?.message);
    }
    await authService(redis).sendPhoneLoginCode(parsed.data.phone);
    return reply.success(null, "验证码已发送");
}

/**
 * 手机号验证码登录
 * @param request 请求
 * @param reply 响应
 */
export async function phoneCodeLoginHandler(request: FastifyRequest, reply: FastifyReply) {
    const parsed = phoneCodeAuthDto.safeParse(request.body);
    if (!parsed.success) {
        throw new BizException(BizCode.PARAM_INVALID, parsed.error.issues[0]?.message);
    }
    const ip = request.ip;
    const userAgent = request.headers["user-agent"];
    const { redis } = request.server;
    const token = await authService(redis).phoneCodeLogin(parsed.data.phone, parsed.data.code, ip, userAgent);
    return reply.success(token, "登录成功");
}