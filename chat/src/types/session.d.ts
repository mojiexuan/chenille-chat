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
    messages: Message[];
}

/**
 * 消息类型
 */
export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    isStreaming: boolean;
}