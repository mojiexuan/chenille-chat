import type { SessionDetail, Message, SessionItem } from '@/types';
import { get, del } from './fetch';

/**
 * 获取会话标题
 */
export const getSessionTitleRequest = (sessionId: number) => {
    return get<string>(`/chat/session/${sessionId}/title`);
}

/**
 * 获取会话
 */
export const getSessionRequest = async (sessionId: number): Promise<SessionDetail> => {
    return await get<{ session: SessionItem, messages: Message[] }>(`/chat/session/${sessionId}`)
        .then((res) => ({
            ...res.session,
            messages: res.messages,
        }));
}

/**
 * 删除会话
 */
export const deleteSessionRequest = (sessionId: number) => {
    return del(`/chat/session/${sessionId}`, {
        showSuccessToast: true,
    });
}
