/**
 * 会话附件信息
 */
export interface ChatAttachmentUploadInfo {
  /** 附件 ID */
  id: string;
  /** 文件 */
  file: File;
  /** 文件名 */
  fileName: string;
  /** 文件 URL */
  fileUrl: string;
  /** 文件类型 */
  fileType: "image" | "file";
  /** 上传状态 */
  status: "uploading" | "uploaded" | "failed";
}

/**
 * 调用 AI 聊天接口参数
 */
export interface AiChatParams {
  message: string;
  sessionId?: string;
  modelId?: string;
  workSpace?: string;
  regenerate?: boolean;
}

/**
 * 调用的Token用量
 */
export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: {
    cached_tokens: number;
  };
}

/**
 * 聊天 SSE 消息（对应后端 MessageCallback）
 */
export interface ChatSseMessage {
  /** 会话 ID */
  sessionId?: string;
  /** 思考过程 */
  reasoning?: string;
  /** 回复内容 */
  content?: string;
  /** 调用的Token用量 */
  usage?: ChatUsage;
  /** 是否完成 */
  finished: boolean;
  /** 错误信息 */
  error?: string;
}
