import { pgTable, pgEnum, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { sessions } from "./session.schema";
import { Role } from "@/enumeration";

/**
 * 消息角色
 */
export const roleEnum = pgEnum("role", Object.values(Role) as [string, ...string[]]);

export const messages = pgTable("c_messages", {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
        .notNull()
        .references(() => sessions.id, { onDelete: "cascade" }),
    parentId: integer("parent_id")
        .references((): any => messages.id, { onDelete: "set null" }),
    role: roleEnum("role").notNull(),          // "user" | "assistant" | "system"
    content: jsonb("content").notNull(),   // 存完整的 Message 内容（文本/多模态/工具调用）
    meta: jsonb("meta"),                   // isMeta、isVirtual、toolUseResult 等元信息
    createdAt: timestamp("created_at").defaultNow().notNull(),
});