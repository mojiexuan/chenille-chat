import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { MessageStreaming, SessionItem, Session } from "@/types";
import { getSessionList, getSessionRequest, deleteSessionRequest } from "@/request";

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
        id: void 0,
        title: "新会话",
        messages: [],
    });
    // 是否正在回复
    const isReplying = ref(false);
    // 当前会话总token数
    const currentSessionTotalTokens = computed(() => {
        return currentSession.value.messages.reduce((sum, msg) => sum + (msg.totalTokens || 0), 0);
    });
    // 当前会话总缓存token数
    const currentSessionCachedTokens = computed(() => {
        return currentSession.value.messages.reduce((sum, msg) => sum + (msg.cachedTokens || 0), 0);
    });
    // 缓存命中率
    const currentSessionCacheHitRate = computed(() => currentSessionTotalTokens.value > 0 ? Math.round((currentSessionCachedTokens.value / currentSessionTotalTokens.value) * 100) : 0)
    // 当前会话工作空间
    const currentSessionWorkSpace = ref<string | null>(null);
    // 当前会话工作空间状态
    const isCurrentSessionWorkSpaceStatus = ref<"none" | "ready" | "error">("none");
    // 加载指示器
    const gerundIndicator = ref(["加载中", "处理中", "工作中"]);

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
        if (currentSession.value.id !== void 0 && title && title !== "新会话") {
            currentSession.value.title = title;
            if (sessions.value.find((item) => item.id === currentSession.value.id)) {
                return;
            }
            sessions.value.unshift({
                id: currentSession.value.id,
                title,
            });
        }
    }

    /**
     * 重置当前会话
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function resetCurrentSession(): void {
        if (currentSession.value.id !== void 0) {
            hasMoreSessions.value = true;
            getSessions();
        }
        currentSession.value = {
            id: void 0,
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

    /**
     * 删除会话
     * @param sessionId 会话ID
     * @author 陈佳宝
     * @date 2026-05-31
     */
    async function deleteSession(sessionId: number) {
        await deleteSessionRequest(sessionId);
        // 如果当前会话是删除的会话，重置当前会话
        if (currentSession.value.id === sessionId) {
            resetCurrentSession();
        }
        // 删除会话列表中的会话
        sessions.value = sessions.value.filter((item) => item.id !== sessionId);
    }

    /**
     * 更新当前会话工作空间
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function updateCurrentSessionWorkSpace(workSpace: string | null): void {
        currentSessionWorkSpace.value = workSpace;
    }

    return {
        sessions,
        currentSession,
        currentSessionTotalTokens,
        currentSessionCachedTokens,
        currentSessionCacheHitRate,
        isReplying,
        currentSessionWorkSpace,
        isCurrentSessionWorkSpaceStatus,
        gerundIndicator,
        getSessions,
        updateCurrentSessionId,
        updateCurrentSessionTitle,
        resetCurrentSession,
        addCurrentSessionMessage,
        getMessageInCurrentSession,
        switchCurrentSession,
        deleteSession,
        updateCurrentSessionWorkSpace,
    };
});
