import { SessionId } from "./ids.type";
import { Message } from "./message.type";

export interface SessionDataBase {
  sessionId: SessionId;
  parentSessionId?: SessionId | undefined; // 父会话ID
}

/**
 * 会话数据
 */
export interface SessionData extends SessionDataBase {
  title?: string; // 会话标题
  timestamp: number; // 会话创建时间戳
  messages: Message[]; // 会话消息
}

/**
 * 可选会话数据
 */
export type PartialSessionData = Partial<SessionData>;

/**
 * 会话消息
 */
export type SessionMessage = Message & {
  sessionId: SessionId;
};

/**
 * 会话选项
 */
export interface SessionOption extends SessionDataBase {
  /**
   * 加载会话数据
   */
  load?: (sessionId: SessionId) => Promise<SessionData | null | undefined>;
  /**
   * 保存会话数据
   */
  save?: (data: PartialSessionData | SessionMessage) => Promise<void>;
}
