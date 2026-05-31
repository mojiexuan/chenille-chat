import { db, sessions, messages } from "@/db";
import { eq, asc, desc, count } from "drizzle-orm";
import { Role } from "@/enumeration";
import { Pagination } from "@/types/pagination.type";

/**
 * 会话服务
 */
export class SessionService {
    /**
     * 创建会话
     * @param userId 用户ID
     * @param title 会话标题
     */
    async createSession(userId: number, title?: string) {
        const [session] = await db.insert(sessions).values({
            userId,
            title,
        }).returning();
        return session;
    }

    /**
     * 获取会话
     * @param sessionId 会话ID
     * @param userId 用户ID
     */
    async getSession(sessionId: number, userId: number) {
        const [session] = await db.select().from(sessions)
            .where(eq(sessions.id, sessionId))
            .limit(1);
        if (!session || session.userId !== userId) {
            return null;
        }
        return session;
    }

    /**
     * 获取或创建会话
     * @param sessionId 会话ID
     * @param userId 用户ID
     * @param userId 用户ID
     */
    async getOrCreateSession(sessionId: number | undefined, userId: number) {
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
    async addMessage(sessionId: number, role: Role, content: unknown, meta?: unknown) {
        const [message] = await db.insert(messages).values({
            sessionId,
            role,
            content,
            meta,
        }).returning();
        return message;
    }

    /**
     * 获取消息
     * @param sessionId 会话ID
     */
    async getMessages(sessionId: number) {
        return db.select().from(messages)
            .where(eq(messages.sessionId, sessionId))
            .orderBy(asc(messages.createdAt));
    }

    /**
     * 更新会话标题
     * @param sessionId 会话ID
     * @param title 会话标题
     */
    async updateSessionTitle(sessionId: number, title: string) {
        await db.update(sessions)
            .set({ title })
            .where(eq(sessions.id, sessionId));
    }

    /**
     * 获取用户会话
     * @param userId 用户ID
     */
    async getUserSessions(userId: number, page = 1, pageSize = 20): Promise<Pagination<typeof sessions.$inferSelect>> {
        const offset = (page - 1) * pageSize;
        const [totalRow] = await db.select({ total: count() })
            .from(sessions)
            .where(eq(sessions.userId, userId));
        const list = await db.select().from(sessions)
            .where(eq(sessions.userId, userId))
            .orderBy(desc(sessions.updatedAt))
            .limit(pageSize)
            .offset(offset);
        return { list, total: totalRow.total, page, pageSize };
    }
}