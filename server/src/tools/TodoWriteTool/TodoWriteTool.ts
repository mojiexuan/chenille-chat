import { z } from "zod/v4";
import { buildTool } from "../tools";
import { TODO_WRITE_TOOL_NAME } from "./prompt";
import { lazySchema } from "@/utils";

const todoItemSchema = lazySchema(() =>
  z.object({
    content: z.string(),
    status: z.enum(["pending", "in_progress", "completed"]),
    id: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  }),
);

const inputSchema = lazySchema(() =>
  z.object({
    todos: z.array(todoItemSchema()).min(3).max(10),
  }),
);

const outputSchema = lazySchema(() =>
  z.object({
    status: z.string().default("success"),
    message: z.string(),
  }),
);

export const TodoWriteTool = buildTool({
  name: TODO_WRITE_TOOL_NAME,
  maxResultSizeChars: 10_000,
  async prompt() {
    return `使用此工具创建和管理任务列表，用于跟踪当前编码会话的进度。
将复杂任务分解为可管理的步骤，并使用此工具向用户展示进度。

何时使用：
- 复杂多步骤任务（3个或更多不同步骤）
- 非平凡和复杂任务
- 用户明确要求todo列表
- 用户提供多个任务
- 收到新指令后 - 立即将用户需求捕捉为todos
- 开始处理任务时
- 完成任务后

任务管理规则：
- 实时更新任务状态
- 完成后立即标记任务为完成
- 一次只应有一个任务处于in_progress状态
- 在开始新任务之前完成当前任务`;
  },
  get inputSchema() {
    return inputSchema();
  },
  get outputSchema() {
    return outputSchema();
  },
  async description() {
    return "创建和管理结构化任务列表，用于跟踪进度和组织复杂工作";
  },
  async call(args) {
    const todos = args.todos;
    const completed = todos.filter((t) => t.status === "completed").length;
    const inProgress = todos.filter((t) => t.status === "in_progress").length;
    const pending = todos.filter((t) => t.status === "pending").length;

    return {
      data: {
        status: "success",
        message: `任务列表已更新。总计: ${todos.length} 项 (已完成: ${completed}, 进行中: ${inProgress}, 待处理: ${pending})`,
      },
    };
  },
});
