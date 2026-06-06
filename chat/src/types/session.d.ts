/**
 * 会话项类型
 */
export interface SessionItem {
    id: number;
    title: string;
}

/**
 * 会话类型
 */
export interface Session extends SessionItem {
    id?: number;
    messages: MessageStreaming[];
}

/**
 * 消息类型
 */
export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    promptTokens?: number,
    completionTokens?: number,
    totalTokens?: number,
    cachedTokens?: number,
}

/**
 * 流式消息类型
 */
export interface MessageStreaming extends Message {
    isStreaming: boolean;
}

/**
 * 会话详情类型
 */
export interface SessionDetail extends Session {
    messages: Message[];
}