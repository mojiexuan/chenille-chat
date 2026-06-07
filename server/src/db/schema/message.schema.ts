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
import { sql } from "drizzle-orm";
import { sessions } from "./session.schema";
import { AiRole } from "@/enumeration";

export const messages = pgTable(
  "c_messages",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    parentId: integer("parent_id").references((): any => messages.id, {
      onDelete: "set null",
    }),
    role: varchar("role", { length: 20 }).$type<AiRole>().notNull(), // "user" | "assistant" | "system"
    reasoning: text("reasoning"), // 推理内容
    content: text("content").notNull(), // 存完整的 Message 内容（文本）
    promptTokens: integer("prompt_tokens").default(0).notNull(), // 提示token数
    completionTokens: integer("completion_tokens").default(0).notNull(), // 完成token数
    totalTokens: integer("total_tokens").default(0).notNull(), // 总token数
    cachedTokens: integer("cached_tokens").default(0).notNull(), // 缓存命中token数
    meta: jsonb("meta"), // 元信息
    createdDate: date("created_date")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_messages_session_id").on(table.sessionId, table.createdAt),
    index("idx_messages_created_date").on(table.createdDate),
  ],
);
