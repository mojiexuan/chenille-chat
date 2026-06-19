import fp from "fastify-plugin";
import fastifyWebsocket from "@fastify/websocket";

/**
 * WebSocket 插件
 */
export const websocketPlugin = fp(async (fastify) => {
    await fastify.register(fastifyWebsocket, {
        options: {
            maxPayload: 1048576, // 1MB
        },
    });
});