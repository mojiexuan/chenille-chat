import { pgTable, pgEnum, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { LoginType, LoginStatus } from "@/enumeration";

/**
 * 登录类型
 */
export const loginTypeEnum = pgEnum("login_type", Object.values(LoginType) as [string, ...string[]]);

/**
 * 登录状态
 */
export const loginStatusEnum = pgEnum("login_status", Object.values(LoginStatus) as [string, ...string[]]);

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