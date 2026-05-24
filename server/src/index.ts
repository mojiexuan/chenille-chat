import Fastify from "fastify";
import { config } from "@/config";
import { responsePlugin, errorHandlerPlugin, autoControllerPlugin, redisClientPlugin } from "@/plugins";
import { logger } from "@/utils";

const app = Fastify({
  logger,
});

// 注册错误处理插件
app.register(errorHandlerPlugin);
// 注册响应插件
app.register(responsePlugin);
// 注册Redis插件
app.register(redisClientPlugin);
// 注册自动控制器插件
app.register(autoControllerPlugin);

app.listen({ port: Number(config.APP_PORT) }, (err) => {
  if (err) throw err;
  app.log.info(`http://127.0.0.1:${config.APP_PORT}`);
});