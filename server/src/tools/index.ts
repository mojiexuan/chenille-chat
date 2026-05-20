import { Tools } from "@/types";
import { AppFeedbackTool } from "./AppFeedbackTool/AppFeedbackTool";
import { AskUserQuestionTool } from "./AskUserQuestionTool/AskUserQuestionTool";
import { TodoWriteTool } from "./TodoWriteTool/TodoWriteTool";
import { SleepTool } from "./SleepTool/SleepTool";

export * from "./tools";
export * from "./AppFeedbackTool";
export * from "./AskUserQuestionTool";
export * from "./TodoWriteTool";
export * from "./SleepTool";

export const builtInTools = [
  AppFeedbackTool,
  AskUserQuestionTool,
  TodoWriteTool,
  SleepTool,
] as const;

/**
 * 获取所有内置工具
 */
export function getTools(): Tools {
  return builtInTools as unknown as Tools;
}
