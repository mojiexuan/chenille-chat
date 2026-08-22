import {
  Tool,
  Tools,
  ToolProgressData,
  ToolDef,
  ToolCall,
  ToolMessage,
  PreparedToolCall
} from "@/types";
import z from "zod/v4";

// 工具默认值
export const TOOL_DEFAULTS = {
  isEnabled: () => true,
  isConcurrencySafe: (_input?: unknown) => false,
  isReadOnly: (_input?: unknown) => false,
  isDestructive: (_input?: unknown) => false,
};

/**
 * 检查工具是否与给定名称（主要名称或别名）匹配
 * @param tool 工具
 * @param name 名称
 * @returns 是否匹配
 */
export function toolMatchesName(
  tool: { name: string; aliases?: string[] },
  name: string,
): boolean {
  return tool.name === name || (tool.aliases?.includes(name) ?? false);
}

/**
 * 从工具列表中按名称或别名查找工具
 * @param tools 工具列表
 * @param name 名称
 * @returns 工具
 */
export function findToolByName(tools: Tools, name: string): Tool | undefined {
  return tools.find((t) => toolMatchesName(t, name));
}

/**
 * 构建工具
 */
export function buildTool<
  TInput extends z.ZodTypeAny,
  TOutput extends z.ZodTypeAny,
  P extends ToolProgressData = ToolProgressData,
>(def: ToolDef<TInput, TOutput, P>): Tool<TInput, TOutput, P> {
  return {
    ...TOOL_DEFAULTS,
    ...def,
  } as Tool<TInput, TOutput, P>;
}

/**
 * 准备工具调用
 */
function prepareToolCall(toolCall: ToolCall, tools: Tools): PreparedToolCall {
  const tool = findToolByName(tools, toolCall.name);
  if (!tool) {
    return { ok: false, error: { type: "tool", message: { role: "tool", toolCallId: toolCall.id, content: `错误: 未找到工具 "${toolCall.name}"` } } };
  }
  let args: unknown;
  try {
    args = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};
  } catch {
    return { ok: false, error: { type: "tool", message: { role: "tool", toolCallId: toolCall.id, content: `参数错误: 无法解析 "${toolCall.name}" 的参数` } } };
  }
  const parsed = tool.inputSchema.safeParse(args);
  if (!parsed.success) {
    return { ok: false, error: { type: "tool", message: { role: "tool", toolCallId: toolCall.id, content: `参数错误: ${parsed.error.message}` } } };
  }
  return { ok: true, tool, toolCall, args: parsed.data };
}

/**
 * 运行工具
 */
async function runTool(tool: Tool, toolCall: ToolCall, args: unknown): Promise<ToolMessage> {
  try {
    const result = await tool.call(args);
    const outputParsed = tool.outputSchema.safeParse(result.data);
    if (!outputParsed.success) {
      return { type: "tool", message: { role: "tool", toolCallId: toolCall.id, content: `工具输出错误: ${outputParsed.error.message}` } };
    }
    return { type: "tool", message: { role: "tool", toolCallId: toolCall.id, content: JSON.stringify(outputParsed.data) } };
  } catch (err) {
    return { type: "tool", message: { role: "tool", toolCallId: toolCall.id, content: `工具执行错误: ${(err as Error).message}` } };
  }
}

/**
 * 执行单个工具调用
 */
export async function executeToolCall(toolCall: ToolCall, tools: Tools): Promise<ToolMessage> {
  const prepared = prepareToolCall(toolCall, tools);
  if (!prepared.ok) return prepared.error;
  return runTool(prepared.tool, prepared.toolCall, prepared.args);
}

/**
 * 执行多个工具调用
 */
export async function executeToolCalls(toolCalls: ToolCall[], tools: Tools): Promise<ToolMessage[]> {
  // 初始化结果数组
  const results: ToolMessage[] = new Array(toolCalls.length);
  // 初始化缓冲区
  let buffer: { index: number; tool: Tool; toolCall: ToolCall; args: unknown }[] = [];

  // 刷新缓冲区
  const flush = async () => {
    const batch = buffer;
    buffer = [];
    // 执行缓冲区中的工具调用
    await Promise.all(batch.map(async ({ index, tool, toolCall, args }) => {
      // 执行工具调用
      results[index] = await runTool(tool, toolCall, args);
    }));
  };

  // 遍历工具调用列表
  for (let i = 0; i < toolCalls.length; i++) {
    // 准备工具调用
    const prepared = prepareToolCall(toolCalls[i], tools);
    // 检查工具调用是否成功
    if (!prepared.ok) {
      results[i] = prepared.error;
      continue;
    }
    // 检查工具是否并发并发安全
    if (prepared.tool.isConcurrencySafe(prepared.args)) {
      // 并发安全工具，直接添加到缓冲区
      buffer.push({ index: i, tool: prepared.tool, toolCall: prepared.toolCall, args: prepared.args });
    } else {
      // 非并发安全工具，刷新缓冲区
      await flush();
      // 执行工具调用
      results[i] = await runTool(prepared.tool, prepared.toolCall, prepared.args);
    }
  }
  // 刷新缓冲区
  await flush();
  // 返回结果
  return results;
}
