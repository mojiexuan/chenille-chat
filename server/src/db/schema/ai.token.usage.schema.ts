import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { users, sessions, messages } from "@/db";

export const aiTokenUsages = pgTable("c_ai_token_usages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // 用户ID
  sessionId: text("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  messageId: text("message_id").references(() => messages.id, {
    onDelete: "set null",
  }),
  promptTokens: integer("prompt_tokens").default(0).notNull(), // 提示token数
  completionTokens: integer("completion_tokens").default(0).notNull(), // 完成token数
  totalTokens: integer("total_tokens").default(0).notNull(), // 总token数
  cachedTokens: integer("cached_tokens").default(0).notNull(), // 缓存命中token数
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
