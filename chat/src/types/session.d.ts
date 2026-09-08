/**
 * 会话项类型
 */
export interface SessionItem {
    id: string;
    title: string;
    workSpace?: string;
}

/**
 * 会话类型
 */
export interface Session extends SessionItem {
    id?: string;
    messages: MessageStreaming[];
}

/**
 * 消息类型
 */
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
    promptTokens?: number,
    completionTokens?: number,
    totalTokens?: number,
    cachedTokens?: number,
    error?: string,
    attachments?: MessageAttachment[];
}

/**
 * 流式消息类型
 */
export interface MessageStreaming extends Message {
    isStreaming: boolean;
}

/**
 * 会话详情类型
 */
export interface SessionDetail extends Session {
    messages: Message[];
}

/**
 * 消息附件类型
 */
export interface MessageAttachment {
    id?: string;
    messageId?: string;
    userId?: string;
    userRole?: 'user' | 'assistant';
    fileName: string;
    type: "image" | "file";
    url: string;
    size?: number;
}