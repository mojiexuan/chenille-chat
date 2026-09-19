import Fastify from "fastify";
import FastifyCookie from "@fastify/cookie";
import FastifyCors from "@fastify/cors";
import { config } from "@/config";
import {
  responsePlugin,
  errorHandlerPlugin,
  redisClientPlugin,
  dbClientPlugin,
  multipartPlugin,
  websocketPlugin,
} from "@/plugins";
import { logger } from "@/utils";
import { v1Router, v2Router, wsRouter } from "@/router";
import { runMigrate, runSeed } from "@/db";
import FastifyStatic from "@fastify/static";
import { UPLOADS_PATH, ensurePaths } from "@/constants/path";

/**
 * 主函数
 */
async function main() {
  const app = Fastify({});
  app.log = logger;

  try {
    await runMigrate();
    await runSeed();
  } catch (err) {
    logger.error(err, "数据库迁移或种子数据运行失败，程序退出。");
    process.exit(1);
  }

  // 确保必要路径存在
  ensurePaths();
  // 注册cookie插件
  app.register(FastifyCookie, {
    secret: config.JWT_SECRET,
  });
  // 注册CORS插件
  app.register(FastifyCors, {
    origin: config.CORS_ORIGIN || true,
    credentials: true,
  });
  // 注册multipart插件
  app.register(multipartPlugin);
  // 注册WebSocket插件
  app.register(websocketPlugin);
  // 注册错误处理插件
  app.register(errorHandlerPlugin);
  // 注册响应插件
  app.register(responsePlugin);
  // 注册Redis插件
  app.register(redisClientPlugin);
  // 注册数据库插件
  app.register(dbClientPlugin);
  // 注册静态文件服务
  app.register(FastifyStatic, {
    root: UPLOADS_PATH,
    prefix: "/uploads/",
  });
  // 注册V1控制器插件
  app.register(v1Router, { prefix: "/api/v1" });
  // 注册V2控制器插件
  app.register(v2Router, { prefix: "/api/v2" });
  // 注册WebSocket控制器插件
  app.register(wsRouter, {
    prefix: "/ws",
  });

  app.listen({ port: Number(config.APP_PORT) }, (err) => {
    if (err) throw err;
    app.log.info(`http://127.0.0.1:${config.APP_PORT}`);
  });
}

main();
