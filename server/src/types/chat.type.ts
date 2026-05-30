import { AiAbort } from "./ai.type";

/**
 * 消息回调
 */
export type MessageCallback = {
    reasoning?: string;
    content?: string;
    finished: boolean;
    error?: string;
}

/**
 * 聊天回调
 */
export type ChatCallback = {
    onAbort?: AiAbort;
    onMessage?: (message: MessageCallback) => void;
}