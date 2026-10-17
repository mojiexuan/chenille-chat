/**
 * WebSocket 客户端状态
 */
export type WsClientStatus = "idle" | "connecting" | "open" | "closed";
/**
 * WebSocket 消息类型
 */
export type WsMessageAction = "ping" | "pong" | "error" | "*";

/**
 * WebSocket 客户端选项
 */
export interface WsClientOptions {
    url: string | (() => Promise<string>);
    heartbeat?: { interval: number; data: () => WsMessage }
    reconnect?: { minDelay?: number; maxDelay?: number }
    onOpen?: () => void
}

/**
 * WebSocket 消息类型
 */
export interface WsMessage<T = unknown> { 
    action: WsMessageAction; 
    data?: T 
}

/**
 * WebSocket 事件处理函数
 */
export type WsEventHandler<T = unknown> = (data?: T) => void
