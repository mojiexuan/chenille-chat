import { createAiModel } from "@/models";
import { AgentOption, AgentResult, UserMessage, Message, ChatResult, ChatNormalRequest } from "@/types";
import { executeToolCalls } from "@/tools";

/**
 * 智能体
 */
class Agent {
  
  // 智能体选项
  private options: AgentOption;
  private abortController: AbortController | null = null;

  // 构造函数
  constructor(options: AgentOption) {
    this.options = options;
  }

  /**
   * 运行智能体
   */
  async run(message: string | UserMessage): Promise<AgentResult> {
    // 解构选项
    const { model, session, tools, systemPrompt, maxToolRounds = 10 } = this.options;

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
    // 最终响应内容
    let finalContent = "";

    // 运行智能体循环
    for (let round = 0; round < maxToolRounds; round++) {
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
          stream: false,
        } as ChatNormalRequest);
      } catch (err) {
        // 返回错误响应
        return {
          finished: false,
          message: finalContent || "",
          rounds,
          error: (err as Error).message,
        };
      }

      // 更新最终响应内容
      finalContent = result.message.content || "";
      // 提取工具调用
      const toolCalls = result.message.toolCalls || [];

      // 如果没有工具调用，返回最终响应
      if (toolCalls.length === 0) {
        // 添加助手消息到会话
        session?.addMessage(result);
        // 返回最终响应
        return {
          finished: true,
          message: finalContent,
          rounds,
        };
      }

      // 添加助手消息到会话
      session?.addMessage(result);

      // 执行工具调用
      const toolMessages = await executeToolCalls(toolCalls, tools ?? []);
      // 添加助手消息到会话
      messages.push(result);
      messages.push(...toolMessages);
      session?.addMessage(...toolMessages);
    }

    // 返回最终响应
    return {
      finished: true,
      message: finalContent,
      rounds,
    };
  }

  // 取消运行体
  abort(): void {
    this.abortController?.abort();
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
}

export { Agent };
