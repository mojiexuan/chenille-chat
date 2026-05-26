import { pgEnum } from "drizzle-orm/pg-core";

export enum LoginType {
    Password = "password",
    Sms = "sms",
    WeChat = "wechat",
}

/**
 * 登录类型
 */
export const loginTypeEnum = pgEnum("login_type", Object.values(LoginType) as [string, ...string[]]);

export enum LoginStatus {
    Success = "success",
    Fail = "fail",
}

/**
 * 登录状态
 */
export const loginStatusEnum = pgEnum("login_status", Object.values(LoginStatus) as [string, ...string[]]);