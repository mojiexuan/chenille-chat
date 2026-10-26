import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nextUlid } from "@/utils";
import { users } from "@/db";

/**
 * 用户智能体配置表
 */
export const userAgentProfiles = pgTable("c_user_agent_profiles", {
    id: text("id").primaryKey().$defaultFn(() => nextUlid()),
    userId: text("user_id")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    agentNickname: varchar("agent_nickname", { length: 50 }), // 用户希望的助手的名字
    userAlias: varchar("user_alias", { length: 50 }), // 用户希望助手怎么称呼自己
    personaPrompt: text("persona_prompt"), // 用户给助手的人设
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});
