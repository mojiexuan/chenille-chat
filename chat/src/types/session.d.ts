/**
 * 会话类型
 */
export interface Session {
    id?: number;
    title: string;
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