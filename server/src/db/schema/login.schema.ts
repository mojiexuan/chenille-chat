import {
  pgTable,
  varchar,
  text,
  timestamp,
  date,
  index,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { ulid } from "ulid";
import { users } from "./user.schema";
import { LoginType, LoginStatus } from "@/enumeration";

export const loginLogs = pgTable(
  "c_login_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    loginType: varchar("login_type", { length: 20 })
      .$type<LoginType>()
      .notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    country: varchar("country", { length: 20 }),
    city: varchar("city", { length: 20 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    token: varchar("token", { length: 255 }),
    status: varchar("status", { length: 20 }).$type<LoginStatus>().notNull(),
    failReason: varchar("fail_reason", { length: 255 }),
    createdDate: date("created_date")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_login_logs_user_id").on(table.userId, table.createdAt.desc()),
    index("idx_login_logs_created_date").on(table.createdDate),
  ],
);
