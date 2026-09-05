import { SseEventName } from "@/enumeration";
import { sse, get, post } from "./fetch";
import type {
  ChatSseMessage,
  AiChatParams,
  PaginationRequest,
  PaginationResponse,
  SessionItem,
  ChatAttachmentUploadInfo,
} from "@/types";

/**
 * 获取会话列表
 */
export const getSessionListRequest = (params: PaginationRequest) => {
  return get<PaginationResponse<SessionItem>>("/chat/sessions", { params });
};

/**
 * 上传会话附件
 */
export const uploadChatAttachmentRequest = (attachments:ChatAttachmentUploadInfo[]) => {
  const formData = new FormData();
  attachments.forEach((attachment) => {
    formData.append("file", attachment.file);
  });
  return post<{
    originalName: string;
    url: string;
  }[]>("/chat/attachment", void 0, {
    body: formData,
  });
};

/**
 * 调用 AI 聊天接口
 */
export const aiChatSse = (
  sessionId: string | undefined,
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
export const getGerundIndicatorRequest = (content: string) => {
  return post<string[]>(`/chat/gerund`, { content }, {
    showErrorToast: false,
  });
};
