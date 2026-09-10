import { db, sessions, messages, aiTokenUsages, messageAttachments } from "@/db";
import { eq, asc, desc, count, and } from "drizzle-orm";
import { AiRole, MediaType } from "@/enumeration";
import {
  Pagination,
  Message,
  AssistantMessage,
  UserMessage,
  ChatUsage,
  ChatMessageAttachment,
  UserImageMessage,
} from "@/types";
import { BizException } from "@/exception";
import { BizCode } from "@/enumeration";
import { generateSessionTitle } from "@/session";
import { logger } from "@/utils";
import { UpdateSessionRequestDto } from "@/dto";
import { ossService } from "@/services";

/**
 * 会话服务
 */
class SessionService {
  /**
   * 创建会话
   * @param userId 用户ID
   * @param title 会话标题
   */
  async createSession(userId: string, title?: string) {
    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        title,
      })
      .returning();
    return session;
  }

  /**
   * 获取会话
   * @param sessionId 会话ID
   * @param userId 用户ID
   */
  async getSession(sessionId: string, userId: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);
    if (!session || session.userId !== userId) {
      return null;
    }
    return session;
  }

  /**
   * 删除会话
   * @param sessionId 会话ID
   * @param userId 用户ID
   */
  async deleteSession(sessionId: string, userId: string) {
    await db
      .delete(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
  }

  /**
   * 获取或创建会话
   * @param sessionId 会话ID
   * @param userId 用户ID
   * @param userId 用户ID
   */
  async getOrCreateSession(sessionId: string | undefined, userId: string) {
    if (sessionId) {
      const existing = await this.getSession(sessionId, userId);
      if (existing) return existing;
    }
    return this.createSession(userId);
  }

  /**
   * 添加消息
   * @param sessionId 会话ID
   * @param role 消息角色
   * @param content 消息内容
   * @param meta 消息元数据
   */
  async addMessage(
    userId: string,
    sessionId: string,
    role: AiRole,
    content: string,
    attachments?: ChatMessageAttachment[],
    reasoning?: string | null,
    usage?: ChatUsage,
    meta?: unknown,
  ) {
    const [message] = await db
      .insert(messages)
      .values({
        sessionId,
        role,
        content,
        reasoning: reasoning || null,
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: usage?.total_tokens || 0,
        cachedTokens: usage?.prompt_tokens_details?.cached_tokens || 0,
        meta,
      })
      .returning();
    // 插入附件
    if (attachments && attachments.length > 0) {
      // 构建附件插入值并检查文件是否存在，若不存在则抛出异常
      const attachmentValues = await Promise.all(
        attachments.map(async (a) => {
          const { exists, size } = await ossService.isOssObjectExist(a.url);
          if (!exists) {
            throw new BizException(BizCode.FILE_NOT_FOUND);
          }
          const newUrl = await ossService.finalizeFileFromOss(a.url);
          return {
            messageId: message.id,
            userId,
            role,
            fileName: a.name,
            url: newUrl,
            type: MediaType.Image,
            size,
          }
        }));
      await db.insert(messageAttachments).values(attachmentValues);
    }
    if (usage) {
      // 记录token使用日志，不在意插入失败
      db.insert(aiTokenUsages)
        .values({
          userId,
          sessionId,
          messageId: message.id,
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          cachedTokens: usage.prompt_tokens_details.cached_tokens || 0,
        })
        .catch((e) => logger.warn(e, "记录token使用日志失败"));
    }
    return message;
  }

  /**
   * 获取消息
   * @param sessionId 会话ID
   */
  async getMessages(sessionId: string) {
    return db.query.messages
      .findMany({
        where: eq(messages.sessionId, sessionId),
        orderBy: asc(messages.createdAt),
        with: {
          attachments: true,
        }
      });
  }

  /**
   * 获取用户会话标题
   */
  async getUserSessionTitle(userId: string, sessionId: string) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
      .limit(1);
    if (!session) {
      throw new BizException(BizCode.SESSION_NOT_FOUND);
    }
    if (session.title) {
      return session.title;
    }
    return null;
  }

  /**
   * 生成用户会话标题
   */
  async generateUserSessionTitle(userId: string, sessionId: string) {
    const sessionTitle = await this.getUserSessionTitle(userId, sessionId);
    if (sessionTitle) {
      return sessionTitle;
    }
    const allMessages = await this.getMessages(sessionId);
    const title = await generateSessionTitle(
      this.buildContextMessages(allMessages),
    );
    if (!title) {
      throw new BizException(BizCode.SESSION_TITLE_GENERATE_FAIL);
    }
    this.updateSessionTitle(sessionId, title);
    return title;
  }

  /**
   * 更新会话标题
   * @param sessionId 会话ID
   * @param title 会话标题
   */
  async updateSessionTitle(sessionId: string, title: string) {
    await db.update(sessions).set({ title }).where(eq(sessions.id, sessionId));
  }

  /**
   * 更新会话工作空间和标题
   */
  async updateSession(
    userId: string,
    sessionId: string,
    updateSessionRequest: UpdateSessionRequestDto,
  ) {
    const set: Record<string, unknown> = {};
    if (updateSessionRequest.workSpace) {
      set.workSpace = updateSessionRequest.workSpace;
    }
    if (updateSessionRequest.title) {
      set.title = updateSessionRequest.title;
    }
    if (Object.keys(set).length === 0) {
      return;
    }
    await db
      .update(sessions)
      .set(set)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
    return set;
  }

  /**
   * 获取用户会话
   * @param userId 用户ID
   */
  async getUserSessions(
    userId: string,
    page = 1,
    pageSize = 20,
  ): Promise<Pagination<typeof sessions.$inferSelect>> {
    const offset = (page - 1) * pageSize;
    const [totalRow] = await db
      .select({ total: count() })
      .from(sessions)
      .where(eq(sessions.userId, userId));
    const list = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.updatedAt))
      .limit(pageSize)
      .offset(offset);
    return { list, total: totalRow.total, page, pageSize };
  }

  /**
   * 构建上下文消息
   */
  buildContextMessages(
    dbMessages: (typeof messages.$inferSelect & {
      attachments: typeof messageAttachments.$inferSelect[];
    })[],
  ): Message[] {
    return dbMessages
      .filter(
        (msg) => msg.role === AiRole.User || msg.role === AiRole.Assistant,
      )
      .map((msg) => {
        if (msg.role === AiRole.User) {
          if (msg.attachments.length > 0) {
            return {
              type: "user",
              message: {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: msg.content,
                  },
                  ...msg.attachments.map((attachment) => ({
                    type: "image_url",
                    image_url: {
                      url: attachment.url,
                    },
                  } as UserImageMessage)),
                ]
              }
            } as UserMessage;
          }
          return {
            type: "user",
            message: { role: "user", content: msg.content },
          } as UserMessage;
        }
        return {
          type: "assistant",
          message: { role: "assistant", content: msg.content },
        } as AssistantMessage;
      });
  }
}

export const sessionService = new SessionService();
