import { z } from "zod/v4";
import { buildTool } from "../tools";
import { APP_FEEDBACK_TOOL_NAME, APP_FEEDBACK_TOOL_PROMPT } from "./prompt";
import { lazySchema } from "@/utils";

const inputSchema = lazySchema(() =>
  z.object({
    description: z.string().trim().min(1).max(1000),
    imageUrl: z.string().optional(),
  }),
);

const outputSchema = lazySchema(() =>
  z.object({
    status: z.string().default("success"),
  }),
);

/**
 * 应用反馈工具
 */
export const AppFeedbackTool = buildTool({
  name: APP_FEEDBACK_TOOL_NAME,
  searchHint: "反馈,崩溃,问题",
  maxResultSizeChars: 100_000,
  async prompt(options) {
    return APP_FEEDBACK_TOOL_PROMPT;
  },
  get inputSchema() {
    return inputSchema();
  },
  get outputSchema() {
    return outputSchema();
  },
  async description(input, options) {
    return "用于收集用户反馈的工具";
  },
  async call(args, onProgress) {
    return {
      data: {
        status: "success",
      },
    };
  },
});
