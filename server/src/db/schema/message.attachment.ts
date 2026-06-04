import {
    pgTable,
    serial,
    integer,
    varchar,
    text,
    jsonb,
    timestamp,
    date,
    index,
} from "drizzle-orm/pg-core";
import { messages } from "./message.schema";
import { MessageAttachmentType, Role } from "@/enumeration";
import { users } from "./user.schema";

/**
 * 消息附件表
 */
export const messageAttachments = pgTable(
    "c_message_attachments",
    {
        id: serial("id").primaryKey(),
        messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
        userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
        role: varchar("role", { length: 20 }).$type<Role>().notNull(), // "user" | "assistant" | "system"
        fileName: varchar("file_name", { length: 255 }), // 文件名
        url: varchar("url", { length: 255 }).notNull(),
        type: varchar("type", { length: 20 }).$type<MessageAttachmentType>().notNull(), // "image" | "video" | "audio" | "link"
        size: integer("size").default(0), // 字节大小
        parsingContent: text("parsing_content"), // 解析内容
        meta: jsonb("meta"), // 元信息
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("idx_message_attachments_user_id").on(table.userId, table.createdAt),
    ],
);