import {
  ChatCallback,
  ChatUsage,
  SystemEnvironment,
  Message,
  SystemPrompt,
} from "@/types";
import { createAiModel } from "@/models";
import { BizCode, AiRole, ReasoningEffort } from "@/enumeration";
import { ChatSseDto } from "@/dto";
import {
  getSystemPrompt,
  asSystemPrompt,
  estimateSystemPromptTokens,
  estimateTokens,
  estimateMessagesTokens,
} from "@/utils";
import { sessionService, agentService, userService } from "@/services";
import { logger, formatTime, getWeekDay } from "@/utils";

class AiService {
  constructor() { }

  /**
   * 聊天服务
   * @param params 聊天参数
   */
  async chat(params: {
    userId: string;
    data: ChatSseDto;
    callback?: ChatCallback;
  }) {
    // 获取或创建会话
    const session = await sessionService.getOrCreateSession(
      params.data.sessionId,
      params.userId,
    );

    // 更新会话工作空间
    if (params.data.workSpace && session.workSpace !== params.data.workSpace) {
      session.workSpace = params.data.workSpace;
      await sessionService.updateSession(params.userId, session.id, {
        workSpace: params.data.workSpace,
      });
    }

    // 添加用户消息到会话
    await sessionService.addMessage(
      params.userId,
      session.id,
      AiRole.User,
      params.data.message,
      params.data.attachments || void 0,
    );

    // 获取会话历史消息
    const history = await sessionService.getMessages(session.id);

    // 构建上下文消息
    const contextMessages = sessionService.buildContextMessages(history);

    // 查询agent
    const agent = await agentService.getAiChatDefaultModelAgent(
      params.data.modelId,
    );
    if (!agent) {
      logger.error("未配置AI Chat Agent");
      if (params.callback && params.callback.onMessage) {
        params.callback.onMessage({
          sessionId: session.id,
          error: BizCode.AI_CHAT_ERROR.message,
          finished: true,
          content: "",
        });
      }
      return;
    }

    // 调用AI模型
    const aiModel = createAiModel({
      provider: agent.provider.provider,
      apiKey: agent.provider.apiKey,
      model: agent.model.modelName,
      baseURL: agent.provider.baseUrl,
    });

    // 缓存生成的内容
    let reasoning: string | null = null;
    let content = "";
    let usage: ChatUsage | null = null;

    // 构建系统提示词
    let systemEnvironmentPrompt = await this.buildEnvironmentPrompt(
      params.userId,
    );
    let systemPrompt = asSystemPrompt(
      getSystemPrompt([], systemEnvironmentPrompt),
    );

    try {
      await aiModel.generate({
        stream: true,
        systemPrompt: systemPrompt,
        messages: contextMessages,
        reasoning: {
          effort: ReasoningEffort.High,
        },
        onAbort: params.callback?.onAbort,
        onChunk: (chunk) => {
          // 缓存生成的内容
          if (chunk.reasoning) {
            if (!reasoning) {
              reasoning = "";
            }
            reasoning += chunk.reasoning;
          }
          if (chunk.message.content) {
            content += chunk.message.content;
          }
          usage = chunk.usage || null;
          // 发送消息回调
          if (params.callback && params.callback.onMessage) {
            params.callback.onMessage({
              sessionId: session.id,
              reasoning: chunk.reasoning,
              content: chunk.message.content,
              usage: chunk.usage,
              finished: chunk.finished,
            });
          }
        },
      });
    } catch (err) {
      logger.error(err);
      // throw new BizException(BizCode.AI_CHAT_ERROR);
      if (params.callback && params.callback.onMessage) {
        params.callback.onMessage({
          sessionId: session.id,
          error: BizCode.AI_CHAT_ERROR.message,
          finished: true,
          content: "",
        });
      }
    }

    // 添加AI消息记录到会话
    usage = this.calculateUsage(
      usage,
      systemPrompt,
      contextMessages,
      reasoning || "",
      content,
    );
    // 添加AI消息记录到会话
    sessionService.addMessage(
      params.userId,
      session.id,
      AiRole.Assistant,
      content,
      void 0,
      reasoning,
      usage,
    );
  }

  /**
   * 构建系统环境变量提示词
   */
  private async buildEnvironmentPrompt(userId: string) {
    const user = await userService.getUserInfoById(userId);
    const userSettings = await userService.getUserSetting(userId);
    const env: SystemEnvironment = [];
    const loginLog = await userService.getNewLoginLog(userId);
    // 如果用户启用了位置信息，且登录日志中包含国家和城市，则添加位置信息
    if (userSettings.isLocationEnabled && loginLog && loginLog.country && loginLog.city) {
      env.push({
        key: "当前用户大致位置",
        value: loginLog.country + loginLog.city,
      });
    } else {
      env.push({
        key: "当前用户大致位置",
        value: "未知",
      });
    }
    env.push({
      key: "当前用户昵称",
      value: user.nickname,
    });
    env.push({
      key: "当前北京时间，你可能需要根据用户所在位置估算时间",
      value: formatTime(),
    });
    env.push({
      key: "当前北京时间对应周，你可能需要根据用户所在位置估算时间对应周",
      value: getWeekDay(),
    });
    return env;
  }

  /**
   * 计算AI模型调用的Token用量
   */
  private calculateUsage(
    usage: ChatUsage | null,
    systemPrompt: SystemPrompt,
    messages: Message[],
    reasoning: string,
    content: string,
  ) {
    if (!usage) {
      usage = {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        prompt_tokens_details: {
          cached_tokens: 0,
        },
      };
    }
    if (usage.prompt_tokens === 0) {
      usage.prompt_tokens =
        estimateSystemPromptTokens(systemPrompt) +
        estimateTokens(reasoning + content) +
        estimateMessagesTokens(messages);
    }
    if (usage.completion_tokens === 0) {
      usage.completion_tokens = estimateTokens(content);
    }
    if (usage.total_tokens === 0) {
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;
    }
    return usage;
  }
}

export const aiService = new AiService();
