import { SseEventName } from "@/enumeration";
import { sse, get, post } from "./fetch";
import type {
  ChatSseMessage,
  AiChatParams,
  PaginationRequest,
  PaginationResponse,
  SessionItem,
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
  params: Omit<AiChatParams, "sessionId">,
  onMessage: (msg: ChatSseMessage) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void,
) => {
  return sse<ChatSseMessage, AiChatParams>("/chat/sse", {
    params: { ...params, ...{ sessionId } },
    onMessage: (event) => {
      if (event.event === SseEventName.AI_CHAT_MESSAGE) {
        onMessage(event.data as ChatSseMessage);
      }
    },
    onComplete,
    onError,
  });
};

/**
 * 获取动词指示器
 */
export const getGerundIndicator = (content: string) => {
  return post<string[]>(`/chat/gerund`, { params: { content } });
};
