import {
    pgTable,
    serial,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";
import { users } from "@/db";

export const aiTokenUsages = pgTable("c_ai_token_usages", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // 用户ID
    promptTokens: integer("prompt_tokens").default(0).notNull(), // 提示token数
    completionTokens: integer("completion_tokens").default(0).notNull(), // 完成token数
    totalTokens: integer("total_tokens").default(0).notNull(), // 总token数
    cachedTokens: integer("cached_tokens").default(0).notNull(), // 缓存命中token数
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})
