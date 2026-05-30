/**
 * 调用 AI 聊天接口参数
 */
export interface AiChatParams {
    message: string;
    sessionId?: string;
    model?: string;
}

/**
 * 聊天 SSE 消息（对应后端 MessageCallback）
 */
export interface ChatSseMessage {
    /** 思考过程 */
    reasoning?: string;
    /** 回复内容 */
    content?: string;
    /** 是否完成 */
    finished: boolean;
    /** 错误信息 */
    error?: string;
}