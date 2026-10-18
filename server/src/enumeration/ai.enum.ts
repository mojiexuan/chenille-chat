/**
 * 模型供应商枚举
 */
export enum AiProvider {
  DeepSeek = "deepseek",
  OpenAI = "openai",
  Google = "google",
  Anthropic = "anthropic",
}

/**
 * 角色枚举
 */
export enum AiRole {
  User = "user",
  Assistant = "assistant",
  System = "system",
  Tool = "tool",
}

/**
 * 工具调用状态枚举
 */
export enum ToolCallStatus {
  Running = "running",
  Success = "success",
  Error = "error",
}
