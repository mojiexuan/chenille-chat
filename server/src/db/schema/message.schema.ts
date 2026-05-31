import { pgTable, serial, integer, text, jsonb, timestamp, date, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { sessions } from "./session.schema";
import { roleEnum } from "@/enumeration";

export const messages = pgTable("c_messages", {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
        .notNull()
        .references(() => sessions.id, { onDelete: "cascade" }),
    parentId: integer("parent_id")
        .references((): any => messages.id, { onDelete: "set null" }),
    role: roleEnum("role").notNull(),          // "user" | "assistant" | "system"
    content: text("content").notNull(),   // 存完整的 Message 内容（文本）
    meta: jsonb("meta"),                   // isMeta、isVirtual、toolUseResult 等元信息
    createdDate: date("created_date").default(sql`CURRENT_DATE`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("idx_messages_session_id").on(table.sessionId, table.createdAt),
    index("idx_messages_created_date").on(table.createdDate),
]);