import { z } from "zod/v4";
import { buildTool } from "../tools";
import { ASK_USER_QUESTION_TOOL_NAME } from "./prompt";
import { lazySchema } from "@/utils";

const questionOptionSchema = lazySchema(() =>
  z.object({
    label: z.string().describe("选项标签（1-5个词）"),
    description: z.string().describe("选项说明"),
  }),
);

const questionSchema = lazySchema(() =>
  z.object({
    question: z.string().describe("完整的问题"),
    header: z.string().max(12).describe("问题分类标签（最多12个字符）"),
    options: z.array(questionOptionSchema()).min(2).max(4),
    multiSelect: z.boolean().default(false),
  }),
);

const inputSchema = lazySchema(() =>
  z.object({
    questions: z.array(questionSchema()).min(1).max(4),
  }),
);

const outputSchema = lazySchema(() =>
  z.object({
    status: z.string().default("success"),
    questionCount: z.number(),
    message: z.string(),
  }),
);

export const AskUserQuestionTool = buildTool({
  name: ASK_USER_QUESTION_TOOL_NAME,
  maxResultSizeChars: 5_000,
  async prompt() {
    return `此工具用于在需要时向用户询问问题。当指令模糊、有多种可行方法、或需要用户确认重要决策时使用。

使用场景：
- 用户请求模糊，需要澄清
- 有多种有效方法，需要用户选择
- 在进行可能产生重大影响的决策前需要确认
- 用户可能有偏好影响实现方式

避免使用场景：
- 任务清晰明确
- 可以根据上下文做出合理假设
- 决策不重要`;
  },
  get inputSchema() {
    return inputSchema();
  },
  get outputSchema() {
    return outputSchema();
  },
  async description() {
    return "向用户提出选择题，以澄清需求、确认决策或收集偏好";
  },
  async call(args) {
    const questions = args.questions;
    const lines: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      lines.push(`Q${i + 1}: ${q.question} [${q.header}]${q.multiSelect ? " (多选)" : ""}`);
      for (const opt of q.options) {
        lines.push(`  - ${opt.label}: ${opt.description}`);
      }
      lines.push("");
    }

    return {
      data: {
        status: "success",
        questionCount: questions.length,
        message: lines.join("\n"),
      },
    };
  },
});
