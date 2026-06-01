import { get } from './fetch';

/**
 * 获取会话标题
 */
export const getSessionTitleRequest = (sessionId: number) => {
    return get<string>(`/chat/session/${sessionId}/title`);
}