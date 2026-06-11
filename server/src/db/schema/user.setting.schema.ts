import { pgTable, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "@/db";

/**
 * 用户表
 */
export const userSettings = pgTable("c_user_settings", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    isLocationEnabled: boolean("is_location_enabled").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});
