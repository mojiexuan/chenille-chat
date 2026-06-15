import type { SessionDetail, Message, SessionItem } from '@/types';
import { get, del, patch } from './fetch';

/**
 * 获取会话标题
 */
export const getSessionTitleRequest = (sessionId: string) => {
    return get<string>(`/chat/session/${sessionId}/title`);
}

/**
 * 获取会话
 */
export const getSessionRequest = async (sessionId: string): Promise<SessionDetail> => {
    return await get<{ session: SessionItem, messages: Message[] }>(`/chat/session/${sessionId}`)
        .then((res) => ({
            ...res.session,
            messages: res.messages,
        }));
}

/**
 * 删除会话
 */
export const deleteSessionRequest = (sessionId: string) => {
    return del(`/chat/session/${sessionId}`, {
        showSuccessToast: true,
    });
}

/**
 * 更新会话
 */
export const updateSessionRequest = (sessionId: string, session: Partial<Omit<SessionItem, 'id'>>) => {
    return patch(`/chat/session/${sessionId}`, {
        ...session,
    });
}
