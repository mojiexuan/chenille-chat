import { computed, ref, shallowRef } from "vue";
import { defineStore } from "pinia";
import type { MessageStreaming, SessionItem, Session, ChatAttachmentUploadInfo } from "@/types";
import {
    getSessionListRequest,
    getSessionRequest,
    deleteSessionRequest,
    updateSessionRequest,
    aiChatSse,
    getSessionTitleRequest,
    getGerundIndicatorRequest,
    uploadChatAttachmentRequest
} from "@/request";
import { getValidDirectoryHandle, saveDirectoryHandle } from "@/utils";
import { IndexedKeyEnum } from "@/enumeration";

/**
 * 会话store
 * @author 陈佳宝
 * @date 2026-05-31
 */
export const useSessionStore = defineStore("session", () => {
    // 编辑器消息，用于存储用户输入的消息
    const editorMessage = ref<string>("");
    // 当前选择的附件
    const attachments = ref<ChatAttachmentUploadInfo[]>([]);
    // 是否可以发送消息
    const canSend = computed(() => editorMessage.value.trim().length > 0);
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
    const currentSessionWorkSpace = ref<FileSystemDirectoryHandle | null>(null);
    // 当前会话工作空间状态
    const isCurrentSessionWorkSpaceStatus = ref<"none" | "ready" | "error">("none");
    // 加载指示器
    const gerundIndicator = ref(["加载中", "处理中", "工作中"]);

    /**
     * 查询当前会话工作空间
     * @author 陈佳宝
     * @date 2026-05-31
     */
    async function queryCurrentSessionWorkSpace() {
        if (currentSession.value.id === void 0) {
            currentSessionWorkSpace.value = null;
            isCurrentSessionWorkSpaceStatus.value = "none";
            return;
        }

        try {
            const handle = await getValidDirectoryHandle(IndexedKeyEnum.WORK_SPACE + currentSession.value.id);
            if (handle && handle.kind === "directory") {
                currentSessionWorkSpace.value = handle;
                isCurrentSessionWorkSpaceStatus.value = "ready";
                if (currentSession.value.workSpace !== handle.name) {
                    currentSession.value.workSpace = handle.name;
                    updateSessionRequest(currentSession.value.id!, { workSpace: handle.name });
                }
            } else {
                currentSessionWorkSpace.value = null;
                if (currentSession.value.workSpace) {
                    isCurrentSessionWorkSpaceStatus.value = "error";
                } else {
                    isCurrentSessionWorkSpaceStatus.value = "none";
                }
            }
        } catch {
            currentSessionWorkSpace.value = null;
            if (currentSession.value.workSpace) {
                isCurrentSessionWorkSpaceStatus.value = "error";
            } else {
                isCurrentSessionWorkSpaceStatus.value = "none";
            }
        }
    }

    /**
     * 设置当前会话工作空间
     * @author 陈佳宝
     * @date 2026-05-31
     */
    async function setCurrentSessionWorkSpace(handle: FileSystemDirectoryHandle) {
        currentSessionWorkSpace.value = handle;
        isCurrentSessionWorkSpaceStatus.value = "ready";
        await saveDirectoryHandle(IndexedKeyEnum.WORK_SPACE + currentSession.value.id, handle);
        if (currentSession.value.workSpace !== handle.name) {
            currentSession.value.workSpace = handle.name;
            // 更新会话工作空间
            if (currentSession.value.id !== void 0) {
                updateSessionRequest(currentSession.value.id!, { workSpace: handle.name });
            }
        }
    }

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
        return getSessionListRequest({ page, pageSize })
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
    function updateCurrentSessionId(id: string): void {
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
        isReplying.value = false;
        currentSessionWorkSpace.value = null;
        isCurrentSessionWorkSpaceStatus.value = "none";
        gerundIndicator.value = ["加载中", "处理中", "工作中"];
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
    function switchCurrentSession(sessionId: string) {
        if (currentSession.value.id === sessionId) {
            return;
        }
        currentSession.value.id = sessionId;
        Promise.all([getSessionRequest(sessionId), queryCurrentSessionWorkSpace()])
            .then(([res, _]) => {
                currentSession.value = {
                    id: res.id,
                    title: res.title,
                    messages: res.messages.map((item) => ({
                        ...item,
                        isStreaming: false,
                    })),
                }
            })
            .catch(() => {
                resetCurrentSession();
            });
    }

    /**
     * 删除会话
     * @param sessionId 会话ID
     * @author 陈佳宝
     * @date 2026-05-31
     */
    async function deleteSession(sessionId: string) {
        await deleteSessionRequest(sessionId);
        // 如果当前会话是删除的会话，重置当前会话
        if (currentSession.value.id === sessionId) {
            resetCurrentSession();
        }
        // 删除会话列表中的会话
        sessions.value = sessions.value.filter((item) => item.id !== sessionId);
    }

    /**
     * 添加附件
     * @param attachmentList 附件列表
     * @author 陈佳宝
     * @date 2026-05-31
     */
    async function addAttachment(attachmentList: ChatAttachmentUploadInfo[]) {
        // 记录当前批次附件 id
        const ids = new Set(attachmentList.map((item) => item.id));
        attachments.value.push(...attachmentList);
        // 更新状态
        attachments.value.forEach((item) => {
            if (ids.has(item.id)) item.status = "uploading";
        });

        try {
            const results = await uploadChatAttachmentRequest(attachmentList);

            const urlMap = new Map<string, string>();
            attachmentList.forEach((item, index) => {
                const res = results[index];
                if (res) {
                    urlMap.set(item.id, res.url);
                }
            });

            // 数据回填
            attachments.value.forEach((item) => {
                const url = urlMap.get(item.id);
                if (url) {
                    item.fileUrl = url;
                    item.status = "uploaded";
                }
            });
        } catch {
            attachments.value.forEach((item) => {
                if (ids.has(item.id)) item.status = "failed";
            });
        }
    }

    /**
     * 删除附件
     * @param attachmentId 附件ID
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function removeAttachment(attachmentId: string): void {
        attachments.value = attachments.value.filter((item) => item.id !== attachmentId);
    }

    // 当前请求控制器
    const abortController = shallowRef<AbortController | null>(null);
    /**
     * 发送消息
     * @param regenerate 是否重新生成
     * @param onMessage 消息回调
     * @author 陈佳宝
     * @date 2026-05-31
     */
    function sendMessage({
        currentModelId = void 0,
        regenerate = void 0,
        onUpdateUi = async () => { },
    }: {
        currentModelId?: string;
        regenerate?: {
            index: number;
            messageId: string;
        };
        onUpdateUi?: () => void;
    }) {
        // 如果不能发送且不是重新生成，直接返回
        if (!canSend.value && !regenerate) {
            return;
        }
        // 如果正在回复，直接取消请求
        if (isReplying.value) {
            abortController.value?.abort();
            isReplying.value = false;
            return;
        }

        let message = editorMessage.value.trim();
        editorMessage.value = "";

        // 会话附件URL列表
        const attachmentUrls = attachments.value
            .filter((item) => item.status === "uploaded")
            .map((item) => ({
                name: item.fileName,
                url: item.fileUrl,
            }));

        // 清空附件列表
        attachments.value = [];

        // 如果是重新生成
        if(regenerate){
            const targetIndex = regenerate.index - 1;
            if (targetIndex < 0 || targetIndex >= currentSession.value.messages.length) {
                return;
            }
            const targetMessage = getMessageInCurrentSession(targetIndex);
            if (!targetMessage || targetMessage.id !== regenerate.messageId) {
                return;
            }
            // 重新生成消息内容
            message = targetMessage.content;
            // 删除目标后续消息
            currentSession.value.messages.splice(targetIndex, 1);
        }

        addCurrentSessionMessage(
            {
                id: Date.now().toString(), role: "user", content: message, isStreaming: false,
                attachments: attachmentUrls.map((item) => ({
                    fileName: item.name,
                    url: item.url,
                    type: "image",
                })),
            },
            { id: (Date.now() + 1).toString(), role: "assistant", content: "", isStreaming: true },
        );

        const assistantIndex = currentSession.value.messages.length - 1;
        const assistant = getMessageInCurrentSession(assistantIndex);

        isReplying.value = true;

        // 获取动词指示器
        getGerundIndicatorRequest(message).then((res) => {
            if (res && res.length > 0) {
                gerundIndicator.value = res;
            }
        });

        // 发起请求
        abortController.value = aiChatSse(
            currentSession.value.id,
            {
                message,
                ...(attachmentUrls.length > 0 ? { attachments: attachmentUrls } : {}),
                ...(isCurrentSessionWorkSpaceStatus.value === "ready" ? { workSpace: currentSession.value.workSpace } : {}),
                modelId: currentModelId,
                ...(regenerate ? { regenerate } : {}),
            },
            (msg) => {
                if (msg.error) {
                    if (assistant) {
                        assistant.error = msg.error;
                        assistant.isStreaming = false;
                    }
                    abortController.value?.abort(msg.error);
                    return;
                }

                if (currentSession.value.id !== msg.sessionId && msg.sessionId) {
                    updateCurrentSessionId(msg.sessionId);
                }

                // 有推理内容
                if (msg.reasoning && msg.reasoning.length > 0) {
                    if (assistant) {
                        if (!assistant.reasoning) {
                            assistant.reasoning = "";
                        }
                        assistant.reasoning += msg.reasoning;
                        onUpdateUi?.();
                    }
                }

                // 有内容
                if (msg.content && msg.content.length > 0) {
                    if (assistant) {
                        assistant.content += msg.content;
                        onUpdateUi?.();
                    }
                }

                if (msg.usage) {
                    if (assistant) {
                        assistant.promptTokens = msg.usage.prompt_tokens || 0;
                        assistant.completionTokens = msg.usage.completion_tokens || 0;
                        assistant.totalTokens = msg.usage.total_tokens || 0;
                        assistant.cachedTokens = msg.usage.prompt_tokens_details?.cached_tokens || 0;
                    }
                }

                if (msg.finished) {
                    isReplying.value = false;
                    if (currentSession.value.title === "新会话" && currentSession.value.id) {
                        getSessionTitleRequest(currentSession.value.id).then((title) => {
                            updateCurrentSessionTitle(title);
                        });
                    }
                    if (assistant) {
                        assistant.isStreaming = false;
                    }
                    abortController.value?.abort();
                    return;
                }
            },
            () => {
                // 请求完成
                if (isReplying.value) {
                    isReplying.value = false;
                }
                abortController.value?.abort();
            },
            () => {
                // 请求错误
                if (isReplying.value) {
                    isReplying.value = false;
                }
                abortController.value?.abort();
            },
        );
    }

    return {
        editorMessage,
        attachments,
        canSend,
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
        queryCurrentSessionWorkSpace,
        setCurrentSessionWorkSpace,
        addAttachment,
        removeAttachment,
        sendMessage,
    };
});
