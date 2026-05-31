import { SseEventName } from '@/enumeration';
import { sse } from './fetch';
import type { ChatSseMessage, AiChatParams, ChatSseTitle } from '@/types';

/**
 * 调用 AI 聊天接口
 */
export const aiChatSse = (
    sessionId: number | undefined,
    message: string,
    onMessage: (msg: ChatSseMessage) => void,
    onSession: (param: ChatSseTitle) => void
) => {
    return sse<ChatSseMessage | ChatSseTitle, AiChatParams>('/chat/sse', {
        params: { message, ...({ sessionId }) },
        onMessage: (event) => {
            if (event.event === SseEventName.AI_CHAT_MESSAGE) {
                onMessage(event.data as ChatSseMessage);
            }
            if (event.event === SseEventName.AI_CHAT_SESSION_TITLE) {
                onSession(event.data as ChatSseTitle);
            }
        }
    });
}