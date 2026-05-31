import { ref } from "vue";
import { defineStore } from "pinia";
import type { Message, Session } from "@/types";

/**
 * 会话store
 * @author 陈佳宝
 * @date 2026-05-31
 */
export const useSessionStore = defineStore("session", () => {
    // 会话列表
    const sessions = ref<Session[]>([]);
    // 当前会话
    const currentSession = ref<Session>({
        id: undefined,
        title: "新会话",
        messages: [],
    });

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
    function addCurrentSessionMessage(message: Message) {
        currentSession.value.messages.push(message);
    }

    return {
        sessions,
        currentSession,
        updateCurrentSessionId,
        updateCurrentSessionTitle,
        resetCurrentSession,
        addCurrentSessionMessage,
    };
});
