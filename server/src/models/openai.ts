import {
  ChatResult,
  ChatModel,
  ChatRequest,
  ChatToolCall,
  Message,
  SystemPrompt,
  Tool,
} from "@/types";
import OpenAI from "openai";
import { Stream } from "openai/core/streaming";
import { ChatCompletionCreateParams, ReasoningEffort } from "openai/resources/index";
import z from "zod/v4";
import { AiModel } from "./base.model";

/**
 * OpenAI 模型
 */
class OpenAiModel extends AiModel {
  private client: OpenAI;
  private config: ChatModel & { model: string; baseURL: string };

  constructor(model: ChatModel) {
    super(model);
    this.config = {
      baseURL: "https://api.openai.com/v1",
      model: "gpt-5.5",
      ...model,
    };
    this.client = new OpenAI({
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey,
    });
  }

  async generate(options: ChatRequest): Promise<ChatResult> {
    const controller = new AbortController();
    let aborted = false;

    const abortSignal = () => {
      aborted = true;
      controller.abort();
    };
    const result: ChatResult = {
      type: "assistant",
      message: {
        role: "assistant",
        content: "",
      },
      finished: false,
    };
    // 立即把 abort 暴露给外层
    options.onAbort?.(abortSignal);
    return this.client.chat.completions
      .create(
        {
          model: this.config.model,
          messages: this.buildMessages(options.messages, options.systemPrompt),
          stream: options.stream ?? false,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1024,
          ...(options.jsonSchema
            ? {
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "response",
                  schema: z.toJSONSchema(options.jsonSchema),
                },
              },
            }
            : {}),
          ...(options.tools
            ? {
              tools: await Promise.all(
                options.tools.map(
                  async (tool) => await this.toolToOpenAiClientSchema(tool),
                ),
              ),
              tool_choice: "auto",
            }
            : {}),
          ...(options.reasoning ? {
            reasoning_effort: options.reasoning.effort as ReasoningEffort,
            extra_body: {
              thinking: {
                type: options.reasoning.effort === "none" ? "disabled" : "enabled",
              }, // deepseek 思考参数 // 火山引擎思考参数 // kimi 思考参数
              enable_thinking: options.reasoning.effort !== "none", // 千问开启思考
            } // 兼容参数
          } : {}),
        } as ChatCompletionCreateParams,
        { signal: controller.signal },
      )
      .then(async (stream) => {
        if (!options.stream) {
          const text = (stream as OpenAI.Chat.Completions.ChatCompletion)
            .choices?.[0]?.message?.content;
          result.message.content = text || "";
          result.finished = true;
          const toolCalls = (stream as OpenAI.Chat.Completions.ChatCompletion)
            .choices?.[0]?.message?.tool_calls || [];
          if (toolCalls.length > 0) {
            result.message.toolCalls = toolCalls.flatMap((call) => {
              if (call.type === "function") {
                return {
                  id: call.id,
                  name: call.function?.name,
                  arguments: call.function?.arguments || undefined,
                } as ChatToolCall;
              }
              return [];
            });
          }
          return result;
        }

        let fullText = "";

        for await (const chunk of stream as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>) {
          if (aborted) {
            break;
          }

          // TODO 流式工具调用暂未处理 console.log("流式工具调用", chunk.choices?.[0]?.delta?.tool_calls);

          const content = chunk.choices?.[0]?.delta?.content || "";
          if (content || chunk.choices?.[0]?.finish_reason === "stop") {
            fullText += content;
            if (chunk.usage) {
              result.usage = {
                prompt_tokens: chunk.usage.prompt_tokens,
                completion_tokens: chunk.usage.completion_tokens,
                total_tokens: chunk.usage.total_tokens,
                prompt_tokens_details: {
                  cached_tokens:
                    chunk.usage.prompt_tokens_details?.cached_tokens ?? 0,
                },
              };
            }
            result.finished = chunk.choices?.[0]?.finish_reason === "stop";
            result.message.content = content;
            options.onChunk?.(result);
          }
        }
        result.message.content = fullText;
        result.finished = true;
        return result;
      })
      .catch((err: Error) => {
        if (
          err.name === "AbortError" ||
          (typeof err.message === "string" && err.message.includes("aborted"))
        ) {
          result.finished = true;
          return result;
        }
        throw err;
      });
  }

  /**
   * 构建OpenAI客户端消息参数
   * @returns OpenAI客户端消息参数
   */
  private buildMessages(messages: Message[], systemPrompt?: SystemPrompt) {
    return [
      ...(systemPrompt
        ? [
          {
            role: "system",
            content: systemPrompt.join("\n"),
          } as OpenAI.Chat.Completions.ChatCompletionMessageParam,
        ]
        : []),
      ...messages.map((msg) => {
        if (msg.type === "system") {
          return {
            role: msg.type,
            content: msg.message,
          } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
        }
        if (msg.type === "assistant") {
          return {
            role: msg.message.role,
            content: msg.message.content,
            ...(msg.message.toolCalls
              ? {
                tool_calls: msg.message.toolCalls.map((c) => ({
                  id: c.id,
                  type: "function",
                  function: {
                    name: c.name,
                    arguments: c.arguments || "",
                  },
                })),
              }
              : {}),
          } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
        }
        if (msg.type === "user") {
          return {
            role: msg.message.role,
            content: msg.message.content,
          } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
        }
        if (msg.type === "tool") {
          return {
            role: msg.message.role,
            content: msg.message.content,
            tool_call_id: msg.message.toolCallId,
          } as OpenAI.Chat.Completions.ChatCompletionMessageParam;
        }
        throw new Error(`未知的消息类型: ${msg.type}`);
      }),
    ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  }

  /**
   * 将工具转换为OpenAI客户端工具模式
   */
  private async toolToOpenAiClientSchema(
    tool: Tool,
  ): Promise<OpenAI.Chat.Completions.ChatCompletionTool> {
    const description = (await tool.prompt({ tools: [] })) || "";
    const schema: OpenAI.Chat.Completions.ChatCompletionTool = {
      type: "function",
      function: {
        name: tool.name,
        description,
        parameters: tool.inputSchema.toJSONSchema(),
      },
    };
    return schema;
  }
}

export { OpenAiModel };
