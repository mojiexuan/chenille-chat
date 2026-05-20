// import {
//   SystemMessage,
//   AttachmentMessage,
//   AssistantMessage,
//   UserMessage,
// } from "./message.type";
import { TOOL_DEFAULTS } from "@/tools";
import type { AnyObject } from "./object.type";
import { z } from "zod/v4";
import {
  AssistantMessage,
  AttachmentMessage,
  SystemMessage,
  UserMessage,
} from "./message.type";

export type Tool<
  Input extends z.ZodTypeAny = z.ZodTypeAny,
  Output extends z.ZodTypeAny = z.ZodTypeAny,
  P extends ToolProgressData = ToolProgressData,
> = {
  // 工具名称
  readonly name: string;
  // 工具别名
  readonly aliases?: string[];
  // 工具搜索关键词
  searchHint?: string;
  // 是否为MCP工具
  isMcp?: boolean;
  // 是否延迟加载（需 ToolSearch 发现）
  readonly shouldDefer?: boolean;
  // 是否严格模式
  readonly strict?: boolean;
  // 最大结果字符数
  maxResultSizeChars: number;
  // 是否启用
  isEnabled(): boolean;
  /**
   * 中断行为
   *
   * 当用户在此工具中提交新消息时
   *
   * `cancel` — 停止工具并丢弃其结果
   * `block` — 保持运行,新消息等待处理
   *
   * 未实现时默认为`block`
   */
  interruptBehavior?(): "cancel" | "block";
  call(
    args: z.infer<Input>,
    // parentMessage: AssistantMessage,
    onProgress?: ToolCallProgress<P>,
  ): Promise<ToolResult<z.infer<Output>>>;
  description(
    input: z.infer<Input>,
    options: {
      isNonInteractiveSession: boolean;
      tools: Tools;
    },
  ): Promise<string>;
  prompt(options: { tools: Tools }): Promise<string>;
  /**
   * 输入参数的Zod模式
   */
  readonly inputSchema: Input;
  /**
   * 输出参数的Zod模式
   */
  outputSchema: Output;
  // 是否只读
  isReadOnly(input: z.infer<Input>): boolean;
  // 是否为破坏性操作， 默认为假。仅当工具执行不可逆操作（删除、覆盖、发送）时才设置。
  isDestructive?(input: z.infer<Input>): boolean;
  // 是否并发安全
  isConcurrencySafe(input: z.infer<Input>): boolean;
};

/**
 * 工具列表
 */
export type Tools = readonly Tool[];

/**
 * 工具结果
 */
export type ToolResult<T> = {
  data: T;
  newMessages?: (
    | UserMessage
    | AssistantMessage
    | AttachmentMessage
    | SystemMessage
  )[];
  // 将MCP协议元数据传递给SDK用户
  mcpMeta?: {
    _meta?: Record<string, unknown>;
    structuredContent?: Record<string, unknown>;
  };
};

/**
 * 工具调用进度
 */
export type ToolCallProgress<P extends ToolProgressData = ToolProgressData> = (
  progress: ToolProgress<P>,
) => void;

/**
 * 工具调用进度数据
 */
export type ToolProgressData = {
  kind?: string;
  [key: string]: unknown;
};

/**
 * 工具调用进度
 */
export type ToolProgress<P extends ToolProgressData> = {
  toolUseID: string;
  data: P;
};

/**
 * `buildTool` 为其提供默认值的方法。`ToolDef` 可以省略这些方法；
 * 生成的`Tool`总是包含这些属性。
 */
type DefaultableToolKeys =
  | "isEnabled"
  | "isConcurrencySafe"
  | "isReadOnly"
  | "isDestructive";

/**
 * `buildTool`接受的工具定义。与`Tool`形状相同，但带有
 * 可默认的方法（可选）— `buildTool` 会填充这些方法，因此调用者总是
 * 看到一个完整的“工具”。
 */
export type ToolDef<
  Input extends z.ZodTypeAny = z.ZodTypeAny,
  Output extends z.ZodTypeAny = z.ZodTypeAny,
  P extends ToolProgressData = ToolProgressData,
> = Omit<Tool<Input, Output, P>, DefaultableToolKeys> &
  Partial<Pick<Tool<Input, Output, P>, DefaultableToolKeys>>;

export type AnyToolDef = ToolDef<any, any, any>;

export type BuiltTool<D> = Omit<D, DefaultableToolKeys> & {
  [K in DefaultableToolKeys]-?: K extends keyof D
    ? undefined extends D[K]
      ? ToolDefaults[K]
      : D[K]
    : ToolDefaults[K];
};

export type ToolDefaults = typeof TOOL_DEFAULTS;
