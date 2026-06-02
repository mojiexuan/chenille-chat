import { type } from "os";

/**
 * 系统提示词
 */
export type SystemPrompt = readonly string[] & {
  readonly __brand: "SystemPrompt";
};

/**
 * 系统环境变量，会注入到提示词中
 */
export type SystemEnvironmentItem = {
  readonly key: string;
  readonly value: string;
};

/**
 * 系统环境变量列表，会注入到提示词中
 */
export type SystemEnvironment = readonly SystemEnvironmentItem[];
