import { pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const sessions = pgTable("c_sessions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    parentId: integer("parent_id")
        .references((): any => sessions.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});