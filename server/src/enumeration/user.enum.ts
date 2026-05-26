import { pgEnum } from "drizzle-orm/pg-core";

export enum Gender {
    Male = "male",
    Female = "female",
    Other = "other",
}

/**
 * 性别枚举
 */
export const genderEnum = pgEnum("gender", Object.values(Gender) as [string, ...string[]]);