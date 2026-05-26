import { pgTable, pgEnum, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { Gender } from "@/enumeration";

/**
 * 性别枚举
 */
export const genderEnum = pgEnum("gender", Object.values(Gender) as [string, ...string[]]);

/**
 * 用户表
 */
export const users = pgTable("c_users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    gender: genderEnum("gender").default(Gender.Other),
    wxOpenId: varchar("wx_openid", { length: 255 }),
    avatar: text("avatar"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});