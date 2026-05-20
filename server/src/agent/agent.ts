import { createAiModel } from "@/models";
import { AgentOption, AgentResult, UserMessage, Message, ToolMessage, ChatResult, Tools, ChatToolCall, Tool, ChatNormalRequest } from "@/types";
import { findToolByName } from "@/tools";

class Agent {
  private options: AgentOption;
  private abortController: AbortController | null = null;

  constructor(options: AgentOption) {
    this.options = options;
  }

  async run(message: string | UserMessage): Promise<AgentResult> {
    const { model, session, tools, systemPrompt, maxToolRounds = 10 } = this.options;

    const userMsg = this.buildUserMessage(message);
    session?.addMessage(userMsg);

    const messages: Message[] = [
      ...(session?.getMessages() ?? [userMsg]),
    ];

    const aiModel = createAiModel(model);

    let rounds = 0;
    let finalContent = "";

    for (let round = 0; round < maxToolRounds; round++) {
      rounds++;

      let result: ChatResult;
      try {
        result = await aiModel.generate({
          ...this.options.options,
          systemPrompt,
          messages,
          tools,
          stream: false,
        } as ChatNormalRequest);
      } catch (err) {
        return {
          finished: false,
          message: finalContent || "",
          rounds,
          error: (err as Error).message,
        };
      }

      finalContent = result.message.content || "";
      const toolCalls = result.message.toolCalls || [];

      if (toolCalls.length === 0) {
        session?.addMessage(result);
        return {
          finished: true,
          message: finalContent,
          rounds,
        };
      }

      session?.addMessage(result);

      for (const toolCall of toolCalls) {
        const toolResult = await this.executeToolCall(toolCall, tools ?? []);
        messages.push(result);
        const toolMsg = toolResult;
        messages.push(toolMsg);
        session?.addMessage(toolMsg);
      }
    }

    return {
      finished: true,
      message: finalContent,
      rounds,
    };
  }

  abort(): void {
    this.abortController?.abort();
  }

  private async executeToolCall(
    toolCall: ChatToolCall,
    tools: Tools,
  ): Promise<ToolMessage> {
    const tool = findToolByName(tools as Tool[], toolCall.name);
    if (!tool) {
      return {
        type: "tool",
        message: {
          role: "tool",
          toolCallId: toolCall.id,
          content: `错误: 未找到工具 "${toolCall.name}"`,
        },
      };
    }

    try {
      let args: unknown;
      try {
        args = toolCall.arguments
          ? JSON.parse(toolCall.arguments)
          : {};
      } catch {
        args = {};
      }
      const result = await tool.call(args);
      return {
        type: "tool",
        message: {
          role: "tool",
          toolCallId: toolCall.id,
          content: JSON.stringify(result.data),
        },
      };
    } catch (err) {
      return {
        type: "tool",
        message: {
          role: "tool",
          toolCallId: toolCall.id,
          content: `工具执行错误: ${(err as Error).message}`,
        },
      };
    }
  }

  private buildUserMessage(message: string | UserMessage): UserMessage {
    if (typeof message === "string") {
      return {
        type: "user",
        message: {
          role: "user",
          content: message,
        },
      };
    }
    return message;
  }
}

export { Agent };
