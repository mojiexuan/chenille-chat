/**
 * 客户端操作
 */
export enum WsClientAction {
    Ping = "ping",
}

/**
 * 服务端操作
 */
export enum WsServerAction {
    Pong = "pong",
    Error = "error",
}