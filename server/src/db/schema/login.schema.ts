import { pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { loginTypeEnum, loginStatusEnum } from "@/enumeration";

export const loginLogs = pgTable("c_login_logs", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    loginType: loginTypeEnum("login_type").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    token: varchar("token", { length: 255 }),
    status: loginStatusEnum("status").notNull(),
    failReason: varchar("fail_reason", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});