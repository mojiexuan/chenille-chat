/**
 * 系统提示词
 */
export type SystemPrompt = readonly string[] & {
  readonly __brand: "SystemPrompt";
};
