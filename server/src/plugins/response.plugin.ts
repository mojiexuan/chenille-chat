import type { FastifyInstance, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { BizCode } from "@/enumeration";

declare module "fastify" {
    interface FastifyReply {
        success<T>(data?: T, message?: string): FastifyReply;
        fail(code?: BizCode, message?: string): FastifyReply;
    }
}

async function responsePluginFn(fastify: FastifyInstance) {
    fastify.decorateReply("success", function <T>(
        this: FastifyReply,
        data?: T,
        message?: string,
    ) {
        const body: Record<string, unknown> = {
            code: BizCode.SUCCESS.code,
            message: message || BizCode.SUCCESS.message,
        };
        if (data !== null && data !== undefined) {
            body.data = data;
        }
        return this.send(body);
    });

    fastify.decorateReply("fail", function (this: FastifyReply, code?: BizCode, message?: string) {
        const body: Record<string, unknown> = {
            httpStatus: code ? code.httpStatus : BizCode.FAIL.httpStatus,
            code: code ? code.code : BizCode.FAIL.code,
            message: message ? message : code ? code.message : BizCode.FAIL.message,
        };
        return this.status(body.httpStatus as number).send(body);
    });
}

export const responsePlugin = fp(responsePluginFn, { name: "response" });
