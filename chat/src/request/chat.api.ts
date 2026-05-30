import { sse } from './fetch';
import type { ChatSseMessage, AiChatParams } from '@/types';

/**
 * 调用 AI 聊天接口
 */
export const aiChat = (message: string, onMessage: (msg: ChatSseMessage) => void) => {
    return sse<ChatSseMessage, AiChatParams>('/chat/sse', {
        params: { message }, onMessage: (event) => {
            onMessage(event.data);
        }
    });
}