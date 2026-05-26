import { pgTable, serial, integer, varchar, text, timestamp, date, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
    createdDate: date("created_date").default(sql`CURRENT_DATE`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    index("idx_login_logs_user_id").on(table.userId, table.createdAt.desc()),
    index("idx_login_logs_created_date").on(table.createdDate),
]);