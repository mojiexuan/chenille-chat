import z from "zod/v4";
import { lazySchema, parseWithSchema } from "@/utils";
import { agentService, clientService } from "@/services";
import { logger } from "@/utils";

/**
 * 加载指示器
 */
const indicatorSchema = lazySchema(() =>
  z.object({ indicator: z.array(z.string()).min(3).max(10) }),
);

const LOADING_INDICATOR_PROMPT = `
分析此消息，想出3~5个与该消息相关的积极、愉快和愉悦的中文加载状态词。

要求：

- 必须为中文。
- 每个状态词必须以“中”结尾。
- 每个状态词长度控制在2~4个字，最长不超过5个字。
- 表达正在进行中的动作。
- 语气积极、轻松、愉悦。
- 必须与用户当前请求高度相关。
- 优先选择具体、有画面感、有创造力的词。
- 可以适当加入巧思、趣味性或文学色彩。
- 可以使用同义词、雅致词或不常见但易理解的词。
- 各状态词之间尽量避免重复含义。
- 不要出现标点符号、表情符号或空格。

避免：

- 过于泛化的词：
  加载中、处理中、工作中、执行中、运行中

- 容易引发故障联想的词：
  连接中、断开中、重试中、恢复中、延迟中、冻结中、等待中

- 破坏性词汇：
  删除中、终止中、摧毁中、停止中、退出中、清除中、销毁中

- 消极或令人焦虑的词：
  排查中、修复中、挣扎中、失败中、卡住中

- 可能被视为冒犯或不适当的词：
  渗透中、入侵中、破解中、监听中

返回一个包含单个“indicator”字段的JSON。

返回格式：

{
  "indicator": [
    "状态词1",
    "状态词2",
    "状态词3"
  ]
}

好例子：

用户："帮我写一个 Spring Boot 接口"{"indicator": ["构思中","编写中","打磨中"]}

用户："帮我设计数据库"{"indicator": ["搭建中","规划中","雕琢中"]}

用户："分析这份日志"{"indicator": ["梳理中","解读中","探寻中"]}

用户："帮我生成一张海报"{"indicator": ["绘制中","勾勒中","着色中"]}

用户："写一篇文章"{"indicator": ["酝酿中","铺陈中","润色中"]}

坏例子（过于模糊）：{"indicator": ["加载中","处理中","工作中"]}

坏例子（全部同义重复）：{"indicator": ["编写中","书写中","写作中"]}

坏例子（与任务无关）：{"indicator": ["跳舞中","散步中","睡觉中"]}

坏例子（故障感）：{"indicator": ["重试中","恢复中","连接中"]}

坏例子（破坏性）：{"indicator": ["删除中","销毁中","终止中"]}`;

/**
 * 生成加载指示器
 */
export async function generateGerundIndicator(content: string) {
  const agent = await agentService.getGerundIndicatorAgent();
  if (!agent) {
    logger.error("动名词指示器生成智能体未配置");
    return ["加载中", "处理中", "工作中"];
  }
  const result = await clientService.chat(
    {
      provider: agent.provider.provider,
      apiKey: agent.provider.apiKey,
      baseURL: agent.provider.baseUrl,
      model: agent.model.modelName,
    },
    {
      messages: [
        {
          type: "system",
          message: LOADING_INDICATOR_PROMPT,
        },
        {
          type: "user",
          message: {
            role: "user",
            content: content,
          },
        },
      ],
      jsonSchema: indicatorSchema(),
    },
  );
  const indicator: string[] =
    parseWithSchema(
      indicatorSchema(),
      result.message.content,
    )?.indicator || [];
  if (indicator.length < 3) {
    indicator.push("加载中");
    indicator.push("处理中");
    indicator.push("工作中");
  }
  return indicator;
}
