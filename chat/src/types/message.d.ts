/**
 * 消息类型
 */
export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    isStreaming: boolean;
}