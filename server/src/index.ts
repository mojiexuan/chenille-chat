import Fastify from "fastify";
import { config } from "@/config";
import { responsePlugin, errorHandlerPlugin, redisClientPlugin, dbClientPlugin } from "@/plugins";
import { logger } from "@/utils";
import { v1Router } from "@/router/v1";
import { runMigrate } from "@/db";

/**
 * 主函数
 */
async function main() {
  await runMigrate();

  const app = Fastify({});
  app.log = logger;

  // 注册错误处理插件
  app.register(errorHandlerPlugin);
  // 注册响应插件
  app.register(responsePlugin);
  // 注册Redis插件
  app.register(redisClientPlugin);
  // 注册数据库插件
  app.register(dbClientPlugin);
  // 注册V1控制器插件
  app.register(v1Router, { prefix: "/api/v1" });

  app.listen({ port: Number(config.APP_PORT) }, (err) => {
    if (err) throw err;
    app.log.info(`http://127.0.0.1:${config.APP_PORT}`);
  });
}

main();