import type { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "@/services";
import { sendPhoneCodeDto, phoneCodeAuthDto } from "@/dto";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { config } from "@/config";
import { expiresInToSeconds } from "@/utils";

/**
 * 发送手机号验证码
 * @param request 请求
 * @param reply 响应
 */
export async function sendPhoneCodeHandler(request: FastifyRequest, reply: FastifyReply) {
    const parsed = sendPhoneCodeDto.safeParse(request.body);
    if (!parsed.success) {
        throw new BizException(BizCode.PARAM_INVALID, parsed.error.issues[0]?.message);
    }
    await authService.sendPhoneLoginCode(parsed.data.phone);
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
    // 验证手机号验证码
    const token = await authService.phoneCodeLogin(parsed.data.phone, parsed.data.code, ip, userAgent);
    // 登录成功后，将 JWT 存储到 Cookie 中
    reply.setCookie("access_token", token, {
        httpOnly: true,                                         // 关键：前端 JS 读不到
        secure: config.NODE_ENV === "production",               // 生产强制 HTTPS
        sameSite: "lax",                                        // 挡跨站写请求 CSRF
        path: "/",
        maxAge: expiresInToSeconds(config.JWT_EXPIRES_IN),      // 与 JWT 有效期一致
    });
    return reply.success(null, "登录成功");
}

/**
 * 退出登录
 * @param request 请求
 * @param reply 响应
 */
export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie("access_token", { path: "/" });
    return reply.success(null, "退出成功");
}