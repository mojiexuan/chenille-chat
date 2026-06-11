import { SseEventName } from "@/enumeration";
import { sse, get } from "./fetch";
import type {
    ChatSseMessage,
    AiChatParams,
    PaginationRequest,
    PaginationResponse,
    SessionItem,
    Model,
} from "@/types";

/**
 * 获取会话列表
 */
export const getSessionList = (params: PaginationRequest) => {
    return get<PaginationResponse<SessionItem>>("/chat/session/list", { params });
};

/**
 * 调用 AI 聊天接口
 */
export const aiChatSse = (
    sessionId: number | undefined,
    message: string,
    onMessage: (msg: ChatSseMessage) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void,
) => {
    return sse<ChatSseMessage, AiChatParams>("/chat/sse", {
        params: { message, ...{ sessionId } },
        onMessage: (event) => {
            if (event.event === SseEventName.AI_CHAT_MESSAGE) {
                onMessage(event.data as ChatSseMessage);
            }
        },
        onComplete,
        onError,
    });
};
