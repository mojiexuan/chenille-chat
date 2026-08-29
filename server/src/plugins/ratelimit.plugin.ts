import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import type { FastifyRequest } from "fastify";
import { redis } from "@/db";
import { BizCode } from "@/enumeration";

/**
 * 限流响应构造器：返回项目统一响应格式
 */
const errorResponseBuilder = () => ({
  code: BizCode.RATE_LIMIT.code,
  message: BizCode.RATE_LIMIT.message,
});

/**
 * 全局请求限流插件
 */
export const globalRateLimitPlugin = fp(
    async (fastify)=>{
        await fastify.register(rateLimit, {
            global: true,
            hook: "onRequest",
            max: 300, // 每分钟最多
            timeWindow: "1 minute",
            redis,
            skipOnError: true, // 出现错误（如redis不可用）时放行
            errorResponseBuilder,
        });
    },
    {
        name:"global-rate-limit"
    }
)

/**
 * 认证请求限流插件
 */
export const authRateLimitPlugin = fp(
    async (fastify)=>{
        await fastify.register(rateLimit, {
            global: false,
            hook: "preHandler", // 在路由处理前限流
            keyGenerator: (request: FastifyRequest) => request.userId || request.ip, // 以用户ID或IP为限流键
            max: 100, // 每分钟
            timeWindow: "1 minute",
            redis,
            skipOnError: true, // 出现错误（如redis不可用）时放行
            errorResponseBuilder,
        });
    },
    {
        name:"auth-rate-limit"
    }
)