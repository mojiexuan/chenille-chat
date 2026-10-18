import {
  pgTable,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { messages } from "./message.schema";
import { sessions } from "./session.schema";
import { ToolCallStatus } from "@/enumeration";

/**
 * 消息工具表
 */
export const messageTools = pgTable(
  "c_message_tools",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    messageId: text("message_id").references(() => messages.id, {
      onDelete: "cascade",
    }),
    sessionId: text("session_id").references(() => sessions.id, {
      onDelete: "cascade",
    }),
    toolCallId: varchar("tool_call_id", { length: 255 }).notNull(), // 模型返回的工具调用ID
    name: varchar("name", { length: 255 }).notNull(), // 工具名称
    arguments: jsonb("arguments"), // 工具入参
    status: varchar("status", { length: 20 })
      .$type<ToolCallStatus>()
      .notNull(), // "running" | "success" | "error"
    duration: integer("duration").default(-1), // 执行耗时(ms)
    meta: jsonb("meta"), // 元信息
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_message_tools_message_id").on(table.messageId, table.createdAt),
    index("idx_message_tools_session_id").on(table.sessionId, table.createdAt),
  ],
);