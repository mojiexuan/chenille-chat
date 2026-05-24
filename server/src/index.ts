import Fastify from "fastify";
import { config } from "@/config";
import { responsePlugin, errorHandlerPlugin, autoControllerPlugin } from "@/plugins";

const app = Fastify({
  logger: {
    level: "info",
    name: config.APP_NAME,
    redact: ["req.headers.authorization"],
    ...(
      config.NODE_ENV === "development" ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
            ignore: "pid,hostname",
            singleLine: false,
          }
        }
      } : {}
    )
  }
});

// 注册错误处理插件
app.register(errorHandlerPlugin);
// 注册响应插件
app.register(responsePlugin);
// 注册自动控制器插件
app.register(autoControllerPlugin);

app.listen({ port: Number(config.APP_PORT) }, (err) => {
  if (err) throw err;
  app.log.info(`http://127.0.0.1:${config.APP_PORT}`);
});