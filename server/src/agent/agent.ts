import { createAiModel } from "@/models";
import {
  AgentOption,
  AgentResult,
  UserMessage,
  Message,
  ChatResult,
  ChatRequest,
  ChatUsage,
  SystemPrompt
} from "@/types";
import { executeToolCalls } from "@/tools";
import {
  estimateSystemPromptTokens,
  estimateTokens,
  estimateMessagesTokens,
} from "@/utils";

/**
 * 智能体
 */
class Agent {

  // 智能体选项
  private options: AgentOption;
  // 中止当前生成的信号
  private abortSignal: (() => void) | null = null;

  // 构造函数
  constructor(options: AgentOption) {
    this.options = options;
  }

  /**
   * 运行智能体
   */
  async run(message: string | UserMessage): Promise<AgentResult> {
    // 解构选项
    const { model, session, tools, systemPrompt, maxToolRounds } = this.options;

    // 构建用户消息
    const userMsg = this.buildUserMessage(message);
    // 添加用户消息到会话
    session?.addMessage(userMsg);

    // 构建消息列表
    const messages: Message[] = [
      ...(session?.getMessages() ?? [userMsg]),
    ];

    // 创建AI模型
    const aiModel = createAiModel(model);

    // 运行智能体循环次数
    let rounds = 0;
    // 累计思考过程
    let reasoning = "";
    // 缓存生成的内容
    let content: string = "";
    // 缓存调用统计
    let usage: ChatUsage | undefined = void 0;

    // 循环次数限制
    const limit = maxToolRounds && maxToolRounds > 0 ? maxToolRounds : Infinity;

    // 运行智能体循环
    while (rounds < limit) {
      // 增加循环次数
      rounds++;

      // 生成响应
      let result: ChatResult;
      try {
        // 生成响应
        result = await aiModel.generate({
          ...this.options.options,
          systemPrompt,
          messages,
          tools,
          onAbort: (abort) => {
            // 缓存中止信号，供 abort() 调用
            this.abortSignal = abort;
            this.options.options?.onAbort?.(abort);
          },
          onChunk: (chunk: ChatResult) => {
            this.options.options?.onChunk?.({
              ...chunk,
              finished: false,
            });
          },
        } as ChatRequest);
      } catch (err) {
        // 返回错误响应
        return {
          finished: true,
          reasoning: reasoning || void 0,
          message: content || "",
          usage,
          rounds,
          error: (err as Error).message,
        };
      }

      // 更新本轮响应内容
      content = result.message.content || "";

      // 本轮思考过程
      const roundReasoning = result.reasoning || "";
      // 累计思考过程
      reasoning += roundReasoning;

      // 缓存调用统计
      const roundUsage = this.calculateUsage(
        result.usage,
        systemPrompt,
        messages,
        roundReasoning,
        content
      );

      // 累计调用统计
      usage = usage ? this.mergeUsage(usage, roundUsage) : roundUsage;

      // 提取工具调用
      const toolCalls = result.message.toolCalls || [];

      // 添加助手消息到会话
      messages.push(result);
      session?.addMessage(result);

      // 如果没有工具调用，返回最终响应
      if (toolCalls.length === 0) {
        // 发送完成信号
        this.emitFinished(usage);
        // 返回最终响应
        return {
          finished: true,
          reasoning: reasoning || void 0,
          message: content,
          usage,
          rounds,
        };
      }

      // 执行工具调用
      const toolMessages = await executeToolCalls(toolCalls, tools ?? []);
      messages.push(...toolMessages);
      session?.addMessage(...toolMessages);

      content = "";
    }

    // 发送完成信号
    this.emitFinished(usage);

    // 返回最终响应
    return {
      finished: true,
      reasoning: reasoning || void 0,
      message: content,
      usage,
      rounds,
    };
  }

  // 取消运行体
  abort(): void {
    this.abortSignal?.();
    this.abortSignal = null;
  }

  /**
   * 发送流式完成信号
   */
  private emitFinished(usage?: ChatUsage): void {
    this.options.options?.onChunk?.({
      type: "assistant",
      message: {
        role: "assistant",
        content: "",
      },
      usage,
      finished: true,
    });
  }

  /**
   * 构建用户消息
   */
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

  /**
   * 计算AI模型调用的Token用量
   */
  private calculateUsage(
    usage: ChatUsage | undefined,
    systemPrompt: SystemPrompt | undefined,
    messages: Message[],
    reasoning: string,
    content: string,
  ) {
    const current: ChatUsage = usage ? {
      ...usage,
      prompt_tokens_details: { ...usage.prompt_tokens_details },
    } : {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      prompt_tokens_details: {
        cached_tokens: 0,
      },
    };
    if (current.prompt_tokens === 0) {
      current.prompt_tokens =
        estimateSystemPromptTokens(systemPrompt) +
        estimateTokens(reasoning + content) +
        estimateMessagesTokens(messages);
    }
    if (current.completion_tokens === 0) {
      current.completion_tokens = estimateTokens(content);
    }
    if (current.total_tokens === 0) {
      current.total_tokens = current.prompt_tokens + current.completion_tokens;
    }

    return current;
  }

  /**
   * 合并AI模型调用的Token用量
   */
  private mergeUsage(
    prev: ChatUsage,
    current: ChatUsage,
  ) {
    // 累加历史用量
    return {
      prompt_tokens: prev.prompt_tokens + current.prompt_tokens,
      completion_tokens:
        prev.completion_tokens + current.completion_tokens,
      total_tokens: prev.total_tokens + current.total_tokens,
      prompt_tokens_details: {
        cached_tokens:
          prev.prompt_tokens_details.cached_tokens +
          current.prompt_tokens_details.cached_tokens,
      },
    } as ChatUsage;
  }
}

export { Agent };
