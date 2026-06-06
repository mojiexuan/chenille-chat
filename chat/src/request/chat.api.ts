import { SseEventName } from "@/enumeration";
import { sse, get } from "./fetch";
import type {
    ChatSseMessage,
    AiChatParams,
    ChatSseTitle,
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
    onSession: (param: ChatSseTitle) => void,
) => {
    return sse<ChatSseMessage | ChatSseTitle, AiChatParams>("/chat/sse", {
        params: { message, ...{ sessionId } },
        onMessage: (event) => {
            if (event.event === SseEventName.AI_CHAT_MESSAGE) {
                onMessage(event.data as ChatSseMessage);
            }
            if (event.event === SseEventName.AI_CHAT_SESSION_TITLE) {
                onSession(event.data as ChatSseTitle);
            }
        },
    });
};

/**
 * 获取 AI 模型列表
 */
export const getModelListRequest = () => {
    return get<Model[]>("/chat/model/list");
}
