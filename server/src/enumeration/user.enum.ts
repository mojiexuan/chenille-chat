/**
 * 性别枚举
 */
export enum UserGender {
  Male = "male",
  Female = "female",
  Other = "other",
}

/**
 * 角色枚举
 */
export enum UserRole {
  User = "user",
  Admin = "admin",
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  Active = "active", // 可用
  Disabled = "disabled", // 禁用
  Frozen = "frozen", // 冻结
}
