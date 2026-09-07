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
 * 会话附件参数
 */
export interface AiChatAttachmentParams {
  /** 文件名 */
  name: string;
  /** 文件 URL */
  url: string;
}

/**
 * 调用 AI 聊天接口参数
 */
export interface AiChatParams {
  message: string;
  /** 会话附件URL列表 */
  attachments?: AiChatAttachmentParams[];
  sessionId?: string;
  modelId?: string;
  /** 工作空间 */
  workSpace?: string;
  /** 是否重新生成 */
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
