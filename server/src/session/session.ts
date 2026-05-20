import {
  Message,
  PartialSessionData,
  SessionData,
  SessionId,
  SessionMessage,
  SessionOption,
} from "@/types";
import { randomUUID } from "@/utils";

/**
 * 会话管理
 */
class Session {
  private options: SessionOption;
  private data: SessionData = {
    title: undefined,
    timestamp: Date.now(),
    messages: [],
    sessionId: randomUUID() as SessionId,
    parentSessionId: undefined,
  };

  constructor(options?: SessionOption) {
    if (options) {
      this.options = options;
      this.load();
    } else {
      this.options = {
        sessionId: this.data.sessionId,
        parentSessionId: this.data.parentSessionId,
      };
    }
  }

  /**
   * 添加消息
   * @param message 消息
   */
  addMessage(message: Message): void {
    this.data.messages.push(message);
  }

  /**
   * 获取消息
   */
  getMessages(): Message[] {
    return this.data.messages;
  }

  /**
   * 切换会话
   * @param sessionId 会话ID
   */
  switchSession(sessionId: SessionId): void {
    this.options.sessionId = sessionId;
  }

  /**
   * 获取会话ID
   */
  getSessionId(): SessionId {
    return this.options.sessionId;
  }

  /**
   * 获取父会话ID
   */
  getParentSessionId(): SessionId | undefined {
    return this.options.parentSessionId;
  }

  /**
   * 获取会话标题
   */
  getTitle(): string | undefined {
    return this.data.title;
  }

  /**
   * 设置会话标题
   * @param title 会话标题
   */
  setTitle(title: string): void {
    this.data.title = title;
  }

  /**
   * 导出会话数据
   */
  export(): SessionData {
    return {
      ...this.data,
    };
  }

  /**
   * 转换为JSON字符串
   */
  toJSON(): string {
    return JSON.stringify(this.export());
  }

  /**
   * 加载会话数据
   */
  async load(): Promise<void> {
    try {
      if (this.options.load) {
        const data = await this.options.load(this.options.sessionId);
        if (data) {
          this.data = data;
        }
      }
    } catch (error) {
      console.error("加载会话数据异常", error);
    }
  }

  /**
   * 保存会话数据
   */
  async save(data: PartialSessionData | SessionMessage): Promise<void> {
    try {
      if (this.options.save) {
        await this.options.save(data);
      }
    } catch (error) {
      console.error("保存会话数据异常", error);
    }
  }
}

export { Session };
