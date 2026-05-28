import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { genderEnum, Gender } from "@/enumeration";

/**
 * 用户表
 */
export const users = pgTable("c_users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    nickname: varchar("nickname", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    gender: genderEnum("gender").default(Gender.Other),
    wxOpenId: varchar("wx_openid", { length: 255 }).unique(),
    avatar: text("avatar"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
});