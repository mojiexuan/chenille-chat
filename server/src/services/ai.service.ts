import {
  ChatCallback,
  SystemEnvironment,
  UserMessage,
} from "@/types";
import { BizCode, AiRole, ReasoningEffort } from "@/enumeration";
import { ChatSseDto } from "@/dto";
import {
  getSystemPrompt,
  asSystemPrompt,
} from "@/utils";
import { sessionService, agentService, userService } from "@/services";
import { logger, formatTime, getWeekDay } from "@/utils";
import { getTools } from "@/tools";
import { Session } from "@/session";
import { Agent } from "@/agent";

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

    // 重新生成消息
    if (!params.data.regenerate) {
      // 添加用户消息到会话
      await sessionService.addMessage(
        params.userId,
        session.id,
        AiRole.User,
        params.data.message,
        params.data.attachments || void 0,
      );
    }

    // 获取会话历史消息
    let history = await sessionService.getMessages(session.id);

    // 重新生成
    if (params.data.regenerate) {
      const { messageId } = params.data.regenerate;
      const targetIndex = history.findIndex((msg) => msg.id === messageId);
      if (targetIndex >= 0) {
        let userIndex = targetIndex;
        if (history[targetIndex].role !== AiRole.User) {
          for (let i = targetIndex - 1; i >= 0; i--) {
            if (history[i].role === AiRole.User) {
              userIndex = i;
              break;
            }
          }
        }

        const deleteMessageIds = history.slice(userIndex + 1).map((msg) => msg.id);
        if (deleteMessageIds.length > 0) {
          await sessionService.deleteMessages(session.id, deleteMessageIds);
          const deleteIdSet = new Set(deleteMessageIds);
          history = history.filter((msg) => !deleteIdSet.has(msg.id));
        }
      }

    }

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

    // 获取启用的工具
    const tools = getTools().filter((tool) => tool.isEnabled());

    // 构建系统提示词
    const systemEnvironmentPrompt = await this.buildEnvironmentPrompt(
      params.userId,
    );
    const systemPrompt = asSystemPrompt(
      getSystemPrompt(tools, systemEnvironmentPrompt),
    );

    // 拆分历史上下文与当前用户消息
    const userMessage = contextMessages[
      contextMessages.length - 1
    ] as UserMessage;
    const historyMessages = contextMessages.slice(0, -1);

    // 创建内存会话并注入历史上下文
    const memorySession = new Session();
    memorySession.addMessage(...historyMessages);

    const chatAgent = new Agent({
      name: "",
      description: "",
      model: {
        provider: agent.provider.provider,
        apiKey: agent.provider.apiKey,
        model: agent.model.modelName,
        baseURL: agent.provider.baseUrl,
      },
      session: memorySession,
      tools,
      systemPrompt,
      options: {
        stream: true,
        reasoning: {
          effort: ReasoningEffort.High,
        },
        onAbort: params.callback?.onAbort,
        onChunk: (chunk) => {
          params.callback?.onMessage?.({
            sessionId: session.id,
            reasoning: chunk.reasoning,
            content: chunk.message.content,
            usage: chunk.usage,
            finished: chunk.finished,
          });
        }
      }
    });

    // 运行智能体
    const result = await chatAgent.run(userMessage);

    // 运行异常
    if (result.error) {
      logger.error(result.error);
      params.callback?.onMessage?.({
        sessionId: session.id,
        error: BizCode.AI_CHAT_ERROR.message,
        finished: true,
        content: "",
      });
      return;
    }

    await sessionService.addMessage(
      params.userId,
      session.id,
      AiRole.Assistant,
      result.message,
      void 0,
      result.reasoning,
      result.usage,
    )
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

}

export const aiService = new AiService();
