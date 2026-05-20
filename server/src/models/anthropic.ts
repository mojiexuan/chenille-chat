import {
  ChatResult,
  ChatModel,
  ChatRequest,
  ChatToolCall,
  Message,
  SystemPrompt,
  Tool,
} from "@/types";
import Anthropic from "@anthropic-ai/sdk";
import { AiModel } from "./base.model";
import z from "zod/v4";

class AnthropicModel extends AiModel {
  private client: Anthropic;
  private config: ChatModel & { model: string; baseURL: string };

  constructor(model: ChatModel) {
    super(model);
    this.config = {
      baseURL: "https://api.anthropic.com",
      model: "claude-sonnet-4-20250514",
      ...model,
    };
    this.client = new Anthropic({
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
    options.onAbort?.(abortSignal);

    const systemPrompt = this.buildSystemPrompt(options.systemPrompt);
    const messages = this.buildMessages(options.messages);
    const tools = options.tools
      ? await Promise.all(
          options.tools.map((tool) => this.toolToAnthropicSchema(tool)),
        )
      : undefined;

    try {
      if (options.stream) {
        const stream = this.client.messages.stream(
          {
            model: this.config.model,
            system: systemPrompt,
            messages,
            tools,
            max_tokens: options.max_tokens ?? 4096,
          },
          {
            signal: controller.signal,
          },
        );

        let fullText = "";
        const toolUseBlocks: Map<number, Anthropic.Messages.ToolUseBlock> = new Map();

        for await (const event of stream) {
          if (aborted) break;

          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            result.message.content = event.delta.text;
            options.onChunk?.(result);
          }

          if (event.type === "content_block_start") {
            if (event.content_block.type === "tool_use") {
              toolUseBlocks.set(event.index, event.content_block);
            }
          }

          if (event.type === "content_block_delta") {
            if (event.delta.type === "input_json_delta") {
              const existingBlock = toolUseBlocks.get(event.index);
              if (existingBlock) {
                const name = existingBlock.name;
                if (
                  !result.message.toolCalls ||
                  result.message.toolCalls.length === 0 ||
                  result.message.toolCalls[result.message.toolCalls.length - 1]
                    .name !== name
                ) {
                  if (!result.message.toolCalls)
                    result.message.toolCalls = [];
                  result.message.toolCalls.push({
                    id: existingBlock.id,
                    name,
                    arguments: "",
                  });
                }
                const last = result.message.toolCalls[
                  result.message.toolCalls.length - 1
                ];
                last.arguments = (last.arguments || "") + event.delta.partial_json;
              }
            }
          }

          if (
            event.type === "message_delta" &&
            event.delta.stop_reason === "end_turn"
          ) {
            result.finished = true;
          }
        }
        result.message.content = fullText;
        result.finished = true;
      } else {
        const response = await this.client.messages.create(
          {
            model: this.config.model,
            system: systemPrompt,
            messages,
            tools,
            max_tokens: options.max_tokens ?? 4096,
          },
          {
            signal: controller.signal,
          },
        );

        const textBlocks = response.content.filter(
          (c) => c.type === "text",
        ) as Anthropic.Messages.TextBlock[];
        result.message.content = textBlocks.map((b) => b.text).join("\n");
        result.finished = true;

        const toolBlocks = response.content.filter(
          (c) => c.type === "tool_use",
        ) as Anthropic.Messages.ToolUseBlock[];
        if (toolBlocks.length > 0) {
          result.message.toolCalls = toolBlocks.map((b) => ({
            id: b.id,
            name: b.name,
            arguments: JSON.stringify(b.input),
          }));
        }

        result.usage = {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens:
            response.usage.input_tokens + response.usage.output_tokens,
          prompt_tokens_details: {
            cached_tokens:
              response.usage.cache_read_input_tokens ??
              0,
          },
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (
        error.name === "AbortError" ||
        (typeof error.message === "string" && error.message.includes("aborted"))
      ) {
        result.finished = true;
        return result;
      }
      throw err;
    }

    return result;
  }

  private buildSystemPrompt(
    systemPrompt?: SystemPrompt,
  ): string | undefined {
    if (!systemPrompt) return undefined;
    if (typeof systemPrompt === "string") return systemPrompt;
    if (Array.isArray(systemPrompt)) return systemPrompt.join("\n");
    return undefined;
  }

  private buildMessages(
    messages: Message[],
  ): Anthropic.Messages.MessageParam[] {
    return messages.map((msg) => {
      if (msg.type === "user") {
        const content = msg.message.content;
        if (typeof content === "string") {
          return {
            role: "user",
            content,
          };
        }
        const blocks = Array.isArray(content)
          ? content.map((block) => {
              if (block.type === "text" && "text" in block) {
                return {
                  type: "text" as const,
                  text: (block as { text: string }).text,
                };
              }
              return { type: "text" as const, text: JSON.stringify(block) };
            })
          : [{ type: "text" as const, text: JSON.stringify(content) }];
        return { role: "user", content: blocks } as Anthropic.Messages.MessageParam;
      }

      if (msg.type === "assistant") {
        const blocks: Anthropic.Messages.ContentBlockParam[] = [];
        if (msg.message.content) {
          blocks.push({
            type: "text",
            text: msg.message.content,
          });
        }
        if (msg.message.toolCalls) {
          for (const tc of msg.message.toolCalls) {
            blocks.push({
              type: "tool_use",
              id: tc.id,
              name: tc.name,
              input: tc.arguments ? JSON.parse(tc.arguments) : {},
            });
          }
        }
        return {
          role: "assistant",
          content: blocks,
        };
      }

      if (msg.type === "tool") {
        return {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: msg.message.toolCallId,
              content: msg.message.content,
            },
          ],
        };
      }

      throw new Error(`未知的消息类型: ${msg.type}`);
    });
  }

  private async toolToAnthropicSchema(
    tool: Tool,
  ): Promise<Anthropic.Messages.Tool> {
    const description = (await tool.prompt({ tools: [] })) || "";
    return {
      name: tool.name,
      description,
      input_schema: tool.inputSchema.toJSONSchema() as Anthropic.Messages.Tool.InputSchema,
    };
  }
}

export { AnthropicModel };
