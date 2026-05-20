import { ZodType } from "zod/v4";
import type { SystemPrompt } from "./prompt.type";
import { AssistantMessage, Message } from "./message.type";
import { Tools } from "./tool.type";
import { AiAbort } from "./ai.type";
import { AIProvider } from "@/enumeration";

/**
 * 聊天模型
 */
export interface ChatModel {
  provider: AIProvider;
  apiKey: string;
  baseURL?: string;
  model?: string;
}

/**
 * 聊天请求参数
 */
export type ChatBaseRequest = {
  systemPrompt?: SystemPrompt; // 系统提示词
  messages: Message[]; // 对话内容
  tools?: Tools; // 工具（可选）
  temperature?: number; // 温度（可选）
  max_tokens?: number; // 最大token（可选）
  reasoning?: ChatReasoningRequest; // 思考请求参数（可选）
  onAbort?: AiAbort;
};

export type ChatChunk = (chunk: ChatResult) => void;

/**
 * 思考请求参数
 */
export type ChatReasoningRequest = {
  effort: "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
}

/**
 * 流式输出请求参数
 */
export type ChatStreamRequest = ChatBaseRequest & {
  stream: true; // 是否开启流式输出（可选）
  jsonSchema?: never;
  onChunk?: ChatChunk; // 流式输出回调（可选）
};

/**
 * JSON 输出请求参数
 */
export type ChatJsonRequest = ChatBaseRequest & {
  jsonSchema: ZodType; // JSON 模式（可选）
  stream?: false;
  onChunk?: never;
};

/**
 * 普通请求参数
 */
export type ChatNormalRequest = ChatBaseRequest & {
  stream?: false;
  jsonSchema?: undefined;
  onChunk?: never;
};

/**
 * 聊天请求参数
 */
export type ChatRequest =
  | ChatNormalRequest
  | ChatStreamRequest
  | ChatJsonRequest;

/**
 * 聊天结果
 */
export interface ChatResult extends AssistantMessage {
  reasoning?: string; // 思考过程
  usage?: ChatUsage; // 调用统计
  finished: boolean; // 是否完成对话
}

/**
 * 聊天调用统计
 */
export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: {
    cached_tokens: number;
  };
}

// export interface ChatTool<TSchema extends z.ZodTypeAny, TResult> {
//   name: string;
//   description: string;
//   schema: TSchema;
//   execute: (args: z.infer<TSchema>) => Promise<TResult>;
// }

export interface ChatToolCall {
  id: string;
  name: string;
  arguments?: string; // 原始 JSON 字符串
}

// export interface MCPClient {
//   call<T = unknown>(req: {
//     server: string;
//     action: string;
//     payload?: unknown;
//   }): Promise<T>;
// }
