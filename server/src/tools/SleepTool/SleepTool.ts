import { z } from "zod/v4";
import { buildTool } from "../tools";
import { SLEEP_TOOL_NAME, SLEEP_TOOL_PROMPT } from "./prompt";
import { lazySchema } from "@/utils";

const inputSchema = lazySchema(() =>
  z.object({
    duration: z
      .number()
      .min(1000)
      .max(300_000)
      .default(60_000)
      .describe("休眠时长（毫秒）"),
    reason: z.string().optional().describe("休眠原因"),
  }),
);

const outputSchema = lazySchema(() =>
  z.object({
    status: z.string().default("success"),
    slept: z.number(),
    message: z.string(),
  }),
);

export const SleepTool = buildTool({
  name: SLEEP_TOOL_NAME,
  maxResultSizeChars: 500,
  async prompt() {
    return SLEEP_TOOL_PROMPT;
  },
  get inputSchema() {
    return inputSchema();
  },
  get outputSchema() {
    return outputSchema();
  },
  async description() {
    return "等待指定的时长，然后继续执行。用于在异步操作之间暂停或等待外部事件";
  },
  async call(args) {
    const startTime = Date.now();

    await new Promise<void>((resolve) => {
      setTimeout(resolve, args.duration);
    });

    const actualSlept = Date.now() - startTime;
    return {
      data: {
        status: "success",
        slept: actualSlept,
        message: `已休眠 ${actualSlept}ms${args.reason ? ` (${args.reason})` : ""}`,
      },
    };
  },
});
