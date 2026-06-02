import Fastify from "fastify";
import { config } from "@/config";
import {
  responsePlugin,
  errorHandlerPlugin,
  redisClientPlugin,
  dbClientPlugin,
  multipartPlugin,
} from "@/plugins";
import { logger } from "@/utils";
import { v1Router } from "@/router/v1";
import { runMigrate, runSeed } from "@/db";
import FastifyStatic from "@fastify/static";
import { UPLOADS_PATH, ensurePaths } from "@/constants/path";

/**
 * 主函数
 */
async function main() {
  try {
    await runMigrate();
    await runSeed();
  } catch (err) {
    logger.error(err, "数据库迁移或种子数据运行失败，程序退出。");
    process.exit(1);
  }

  const app = Fastify({});
  app.log = logger;
  // 确保必要路径存在
  ensurePaths();
  // 注册multipart插件
  app.register(multipartPlugin);
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

  app.listen({ port: Number(config.APP_PORT) }, (err) => {
    if (err) throw err;
    app.log.info(`http://127.0.0.1:${config.APP_PORT}`);
  });
}

main();
