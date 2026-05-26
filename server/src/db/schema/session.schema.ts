import { pgTable, serial, integer, varchar, timestamp, date, index } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { sql } from "drizzle-orm";

export const sessions = pgTable("c_sessions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: integer("parent_id")
        .references((): any => sessions.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }),
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
