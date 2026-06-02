import { ref } from "vue";
import { defineStore } from "pinia";
import type { MessageStreaming, SessionItem, Session } from "@/types";
import { getSessionList, getSessionRequest } from "@/request";

/**
 * 会话store
 * @author 陈佳宝
 * @date 2026-05-31
 */
export const useSessionStore = defineStore("session", () => {
    // 会话列表
    const sessions = ref<SessionItem[]>([]);
    // 是否还有更多会话
    const hasMoreSessions = ref(true);
    // 当前会话
    const currentSession = ref<Session>({
        id: undefined,
        title: "新会话",
        messages: [],
    });
    // 是否正在回复
    const isReplying = ref(false);

    /**
     * 获取会话列表
     * @author 陈佳宝
     * @date 2026-05-31
     */
    async function getSessions(page = 1) {
        if (!hasMoreSessions.value || page <= 0) {
            return;
        }
        const pageSize = 20;
        return getSessionList({ page, pageSize })
            .then((res) => {
                sessions.value = res.list || [];
                hasMoreSessions.value = res.list.length < pageSize;
            })
    }

    /**
     * 设置当前会话
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function updateCurrentSessionId(id: number): void {
        currentSession.value.id = id;
    }

    /**
     * 更新当前会话标题
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function updateCurrentSessionTitle(title: string): void {
        if (currentSession.value.id !== undefined) {
            currentSession.value.title = title;
        }
    }

    /**
     * 重置当前会话
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function resetCurrentSession(): void {
        currentSession.value = {
            id: undefined,
            title: "新会话",
            messages: [],
        };
    }

    /**
     * 添加当前会话消息
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function addCurrentSessionMessage(...message: MessageStreaming[]) {
        currentSession.value.messages.push(...message);
    }

    /**
     * 获取当前会话消息
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function getMessageInCurrentSession(index: number): MessageStreaming | undefined {
        return currentSession.value.messages[index];
    }

    /**
     * 切换当前会话
     * @param sessionId 会话ID
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function switchCurrentSession(sessionId: number) {
        if (currentSession.value.id === sessionId) {
            return;
        }
        getSessionRequest(sessionId)
            .then((res) => {
                currentSession.value = {
                    id: res.id,
                    title: res.title,
                    messages: res.messages.map((item) => ({
                        ...item,
                        isStreaming: false,
                    })),
                }
            })
    }

    return {
        sessions,
        currentSession,
        isReplying,
        getSessions,
        updateCurrentSessionId,
        updateCurrentSessionTitle,
        resetCurrentSession,
        addCurrentSessionMessage,
        getMessageInCurrentSession,
        switchCurrentSession,
    };
});
