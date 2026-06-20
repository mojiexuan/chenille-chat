import type { Redis } from "ioredis";
import { logger, randomStr } from "@/utils";
import { BizException } from "@/exception";
import { BizCode, WsClientAction, WsServerAction } from "@/enumeration";
import { CharType } from "@/enumeration";
import {
    REDIS_WS_TICKET_PREFIX,
    REDIS_WS_ONLINE_PREFIX,
} from "@/constants";
import type { WsClientMessage, WsServerMessage } from "@/types";
import type { WebSocket } from "@fastify/websocket";

/**
 * WebSocket 服务
 */
class WsService {
    // Redis 实例
    private _redis: Redis | null = null;
    // 连接映射表
    private connections: Map<string, Set<WebSocket>> = new Map();
    // 操作处理函数
    private handlers = new Map<string, (socket: WebSocket, userId: string, msg: WsClientMessage) => void>();

    init(redis: Redis): WsService {
        this._redis = redis;
        return this;
    }

    /**
     * 获取 Redis 实例
     */
    private get redis(): Redis {
        if (!this._redis) {
            logger.error("WsService 未初始化，请先调用 init(redis)，redis 可从 FastifyRequest.server 对象中获取");
            throw new BizException(BizCode.FAIL);
        }
        return this._redis;
    }

    /**
     * 生成 WebSocket Ticket
     * @returns WebSocket Ticket
     */
    async generateTicket(userId: string): Promise<string> {
        const ticket = randomStr(16, CharType.Upper);
        await this.redis.set(`${REDIS_WS_TICKET_PREFIX}${ticket}`, userId, "EX", 30);
        return ticket;
    }

    /**
     * 验证票据
     * @param ticket 
     * @returns 
     */
    async validateTicket(ticket: string): Promise<string | null> {
        const key = `${REDIS_WS_TICKET_PREFIX}${ticket}`;
        const userId = await this.redis.get(key);
        if (userId) {
            this.redis.del(key);
        }
        return userId;
    }

    /**
     * 添加连接
     * @param userId 用户ID
     * @param socket ws对象
     */
    addConnection(userId: string, socket: WebSocket) {
        if (!this.connections.has(userId)) {
            this.connections.set(userId, new Set());
        }
        this.connections.get(userId)!.add(socket);
        this.redis.set(
            `${REDIS_WS_ONLINE_PREFIX}${userId}`,
            "1",
            "EX",
            3600,
        );
        // 用户上线
    }

    /**
     * 移除连接
     * @param userId 用户ID
     * @param socket ws对象
     */
    removeConnection(userId: string, socket: WebSocket) {
        const sockets = this.connections.get(userId);
        if (!sockets) return;
        sockets.delete(socket);
        if (sockets.size === 0) {
            this.connections.delete(userId);
            this.redis.del(`${REDIS_WS_ONLINE_PREFIX}${userId}`);
            // 用户下线
        }
    }

    /**
     * 发送消息给用户
     * @param userId 用户ID
     * @param data 消息数据
     */
    sendToUser(userId: string, data: WsServerMessage) {
        const sockets = this.connections.get(userId);
        if (!sockets || sockets.size === 0) return;
        const raw = JSON.stringify(data);
        for (const ws of sockets) {
            if (ws.readyState === ws.OPEN) {
                ws.send(raw);
            }
        }
    }

    /**
     * 检查用户是否在线
     * @param userId 用户ID
     * @returns 是否在线
     */
    isOnline(userId: string): boolean {
        return this.connections.has(userId);
    }

    /**
     * 处理连接
     * @param socket ws对象
     * @param userId 用户ID
     */
    handleConnection(socket: WebSocket, userId: string) {
        this.addConnection(userId, socket);
        socket.on("message", (raw: Buffer) => {
            let msg: WsClientMessage;
            try {
                msg = JSON.parse(raw.toString());
            } catch {
                this.sendError(socket, "消息格式无效");
                return;
            }

            if (msg.action === WsClientAction.Ping) {
                this.sendToSocket(socket, { action: WsServerAction.Pong });
                return;
            }

            // 分发消息
            this.dispatch(socket, userId, msg);
        });

        socket.on("close", () => {
            this.removeConnection(userId, socket);
        });

        socket.on("error", (err: Error) => {
            this.removeConnection(userId, socket);
        });
    }

    /**
     * 发送消息给用户
     * @param socket ws对象
     * @param data 消息数据
     */
    private sendToSocket(socket: WebSocket, data: WsServerMessage) {
        if (socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify(data));
        }
    }

    /**
     * 发送错误消息给用户
     * @param socket ws对象
     * @param error 错误信息
     */
    private sendError(socket: WebSocket, error: string) {
        this.sendToSocket(socket, { action: WsServerAction.Error, data: { error } });
    }

    /**
     * 注册 action 处理器
     * @param action 操作
     * @param handler 处理器
     */
    registerAction(
        action: string,
        handler: (socket: WebSocket, userId: string, msg: WsClientMessage) => void,
    ) {
        this.handlers.set(action, handler);
    }

    /**
     * 分发消息
     * @param socket ws对象
     * @param userId 用户ID
     * @param msg 消息数据
     */
    dispatch(socket: WebSocket, userId: string, msg: WsClientMessage) {
        const handler = this.handlers.get(msg.action);
        if (handler) handler(socket, userId, msg);
    }
}

export const wsService = new WsService();