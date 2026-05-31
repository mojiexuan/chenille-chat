import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";

async function errorHandlerPluginFn(fastify: FastifyInstance) {
    fastify.setErrorHandler((error, _request, reply) => {
        fastify.log.error(error);
        if (error instanceof BizException) {
            return reply.status(error.bizCode.httpStatus).send({
                code: error.bizCode.code,
                message: error.message,
            });
        }
        reply.status(BizCode.FAIL.httpStatus).send({
            code: BizCode.FAIL.code,
            message: "服务器内部错误",
        });
    });
}

export const errorHandlerPlugin = fp(errorHandlerPluginFn, { name: "errorHandler" });