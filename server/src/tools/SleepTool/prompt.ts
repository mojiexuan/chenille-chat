import { TICK_TAG } from "@/constants";

export const SLEEP_TOOL_NAME = "Sleep";

export const SLEEP_TOOL_PROMPT = `等待指定的时长。用户可随时中断休眠状态。

当用户告诉你要睡觉或休息时，当你无事可做时，或者当你正在等待某事时，请使用此功能。

你可能会收到\`<${TICK_TAG}>\`提示——这些是定期的签到提醒。在睡觉前，找些有用的工作来做。

你可以同时使用这个工具和其他工具——它不会相互干扰。

每次唤醒都会消耗一次API调用，但提示缓存会在5分钟无活动后过期——请相应地保持平衡。
`;
