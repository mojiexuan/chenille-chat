import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { config } from "@/config";
import { responsePlugin, errorHandlerPlugin, autoControllerPlugin } from "@/plugins";

const app = Fastify({ logger: true });

// 注册错误处理插件
app.register(errorHandlerPlugin);
// 注册响应插件
app.register(responsePlugin);
// 注册WebSocket插件
app.register(fastifyWebsocket);
// 注册自动控制器插件
app.register(autoControllerPlugin);

app.listen({ port: Number(config.APP_PORT) }, (err) => {
  if (err) throw err;
  console.log(`http://127.0.0.1:${config.APP_PORT}`);
});