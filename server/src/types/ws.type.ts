import { WsClientAction, WsServerAction } from '@/enumeration';

/**
 * WebSocket 消息
 */
export interface WsMessage<T = unknown> {
    action: WsClientAction | WsServerAction;
    data?: T;
}

/**
 * 客户端消息
 */
export interface WsClientMessage extends WsMessage {
    action: WsClientAction;
}

/**
 * 服务端消息
 */
export interface WsServerMessage extends WsMessage {
    action: WsServerAction;
}
