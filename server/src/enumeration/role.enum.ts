import { pgEnum } from "drizzle-orm/pg-core";

export enum Role {
    User = "user",
    Assistant = "assistant",
    System = "system",
}

/**
 * 消息角色
 */
export const roleEnum = pgEnum("role", Object.values(Role) as [string, ...string[]]);