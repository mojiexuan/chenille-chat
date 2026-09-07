import { ToolCall } from "./tool.type";
import { MediaType } from "@/enumeration";
import { ExactlyOne } from "./type";

/**
 * 消息来源
 */
export type MessageOrigin = {
  kind?: string;
  [key: string]: unknown;
};

/**
 * 基础消息
 */
export type MessageBase = {
  uuid?: string;
  parentUuid?: string;
  timestamp?: string;
  createdAt?: string;
  isMeta?: boolean; // 是否为元消息（不显示给用户）
  isVirtual?: boolean; // 是否为虚拟消息（临时/占位）
  isCompactSummary?: boolean; // 是否为压缩后的摘要消息
  toolUseResult?: unknown; // 工具使用结果
  origin?: MessageOrigin; // 消息来源信息
};

/**
 * 附件消息
 */
export type AttachmentMessage = MessageBase & {
  type: "attachment";
  content: ({
    type: MediaType;
  } & ExactlyOne<{
    url: string;
    base64: string;
  }>)[]
};

/**
 * 用户消息
 */
export type UserMessage = MessageBase & {
  type: "user";
  message: {
    role: "user";
    content:
    | string
    | Array<UserTextMessage | UserImageMessage>;
  };
};

/**
 * 用户文本消息
 */
export type UserTextMessage = {
  type: "text";
  text: string;
}

/**
 * 用户图片消息详情
 */
export type UserImageMessageDetail = "low" | "high" | "original" | "auto";
/**
 * 用户图片消息
 */
export type UserImageMessage = {
  type: "image_url";
  image_url: string;
  detail?: UserImageMessageDetail;
}

/**
 * 助手消息
 */
export type AssistantMessage = MessageBase & {
  type: "assistant";
  message: {
    role: "assistant";
    content: string;
    toolCalls?: ToolCall[];
  };
};

/**
 * 进度消息
 */
export type ProgressMessage = MessageBase & {
  type: "progress";
  progress?: unknown;
};

/**
 * 系统消息等级
 */
export type SystemMessageLevel = "info" | "warning" | "error" | string;

/**
 * 系统消息
 */
export type SystemMessage = MessageBase & {
  type: "system";
  subtype?: string;
  level?: SystemMessageLevel;
  message?: string;
};

/**
 * 工具消息
 */
export type ToolMessage = MessageBase & {
  type: "tool";
  message: {
    role: "tool";
    content: string;
    toolCallId: string;
  };
};

/**
 * 消息
 */
export type Message =
  | UserMessage
  | AssistantMessage
  | ProgressMessage
  | SystemMessage
  | AttachmentMessage
  | ToolMessage;

/**
 * 会话消息附件
 */
export interface ChatMessageAttachment {
  name: string;
  url: string;
}
