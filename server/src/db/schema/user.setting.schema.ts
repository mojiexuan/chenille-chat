import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { nextUlid } from "@/utils";
import { users } from "@/db";

/**
 * 用户设置表
 */
export const userSettings = pgTable("c_user_settings", {
    id: text("id").primaryKey().$defaultFn(() => nextUlid()),
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
