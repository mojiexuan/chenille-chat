import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { users } from "@/db";

/**
 * 用户表
 */
export const userSettings = pgTable("c_user_settings", {
    id: text("id").primaryKey().$defaultFn(() => ulid()),
    userId: text("user_id")
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
