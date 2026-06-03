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
  fastify.decorateReply("success", function <
    T,
  >(this: FastifyReply, data?: T, message?: string) {
    const body: Record<string, unknown> = {
      code: BizCode.SUCCESS.code,
      message: message || BizCode.SUCCESS.message,
    };
    if (data !== null && data !== void 0) {
      body.data = data;
    }
    return this.send(body);
  });

  fastify.decorateReply(
    "fail",
    function (this: FastifyReply, code?: BizCode, message?: string) {
      const body: Record<string, unknown> = {
        httpStatus: code ? code.httpStatus : BizCode.FAIL.httpStatus,
        code: code ? code.code : BizCode.FAIL.code,
        message: message ? message : code ? code.message : BizCode.FAIL.message,
      };
      return this.status(body.httpStatus as number).send(body);
    },
  );

  // 全局设置响应头
  fastify.addHook("onSend", (request, reply, _payload, done) => {
    // 上传文件不设置响应头
    if (request.url.startsWith("/uploads/")) {
      // 图片、视频等静态资源缓存1天
      reply.header("Cache-Control", "public, max-age=86400");
      // 支持断点续传
      reply.header("Accept-Ranges", "bytes");
      // 允许跨域访问
      reply.header("Access-Control-Allow-Origin", "*");
      done();
      return;
    }
    reply.header(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    reply.header("Pragma", "no-cache");
    reply.header("Expires", "0");
    reply.header("Surrogate-Control", "no-store");
    done();
  });
}

export const responsePlugin = fp(responsePluginFn, { name: "response" });
