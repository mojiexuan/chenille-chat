import { pgTable, text, varchar, timestamp, date, index } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { users } from "./user.schema";
import { sql } from "drizzle-orm";

export const sessions = pgTable("c_sessions", {
    id: text("id").primaryKey().$defaultFn(() => ulid()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: text("parent_id")
        .references((): any => sessions.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }),
    workSpace: varchar("work_space", { length: 550 }), // 工作空间
    createdDate: date("created_date").default(sql`CURRENT_DATE`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}, (table) => [
    index("idx_sessions_user_id").on(table.userId, table.updatedAt.desc()),
    index("idx_sessions_created_date").on(table.createdDate),
]);
