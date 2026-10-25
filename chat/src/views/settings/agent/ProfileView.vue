<template>
    <div class="agent-profile">
        <div class="agent-profile-card">
            <!-- 昵称 -->
            <div class="agent-profile-card-item">
                <span class="agent-profile-card-item-label">昵称</span>
                <input class="agent-profile-card-item-input" type="text" v-model="editorProfile.agentNickname"
                    placeholder="给 Chenille 起个好听的名字" maxlength="20" minlength="1" />
            </div>
            <!-- 称呼 -->
            <div class="agent-profile-card-item">
                <span class="agent-profile-card-item-label">称呼</span>
                <input class="agent-profile-card-item-input" type="text" v-model="editorProfile.userAlias"
                    placeholder="你希望 Chenille 怎么称呼您" maxlength="20" minlength="1" />
            </div>
            <!-- 人设 -->
            <div class="agent-profile-card-item">
                <span class="agent-profile-card-item-label">人设</span>
                <textarea class="agent-profile-card-item-input agent-profile-card-item-input-textarea" type="text"
                    v-model="editorProfile.personaPrompt" placeholder="例如：你是主人桌面上的Q版蓝发小女仆，性格温柔、安静、有点黏人。
碎碎念时只说一句，20字以内，像随口嘀咕，不要提问。
对话时可以多说几句，但保持口语化、简短，一般不超过三行。
会关心主人的状态，但不追问隐私、不说教、不强行安慰。
不要解释你自己，不要提你是AI，不要复述这段设定。" maxlength="6000" minlength="1">
                </textarea>
            </div>
        </div>
        <button class="agent-profile-btn" @click="handleSaveClick">保存</button>
    </div>
</template>

<script setup lang="ts" name="AgentProfile">
import { onMounted, reactive, computed } from "vue";
import { useUserStore } from "@/stores";
import { useToast } from "@/composables";
import { patchUserAgentProfileRequest } from "@/request";
import type { UserAgentProfile } from "@/types";

// 用户store
const userStore = useUserStore();

// 编辑器助手配置
const editorProfile = reactive<Required<UserAgentProfile>>({
    agentNickname: "", // 智能体昵称
    userAlias: "",  // 用户称呼
    personaPrompt: "", // 人设提示词
});

// 已保存的助手配置
const savedProfile = computed<Required<UserAgentProfile>>(() => ({
    agentNickname: userStore.user.agentProfile?.agentNickname || "",
    userAlias: userStore.user.agentProfile?.userAlias || "",
    personaPrompt: userStore.user.agentProfile?.personaPrompt || "",
}));

// 助手配置字段校验规则
const profileRules: Record<keyof UserAgentProfile, { label: string; max: number }> = {
    agentNickname: { label: "昵称", max: 20 },
    userAlias: { label: "称呼", max: 20 },
    personaPrompt: { label: "人设", max: 6000 },
};

// 提示
const toast = useToast();

/**
 * 保存点击
 */
function handleSaveClick() {
    const changedKeys = (Object.keys(editorProfile) as (keyof UserAgentProfile)[])
        .filter((key) => editorProfile[key] !== savedProfile.value[key]);
    if (!changedKeys.length) {
        return;
    }

    // 校验字段长度
    for (const key of changedKeys) {
        const rule = profileRules[key];
        if (editorProfile[key].length > rule.max) {
            toast.error(`${rule.label}长度不能超过${rule.max}个字符`);
            return;
        }
    }

    // 构建更新数据
    const data: UserAgentProfile = {};
    changedKeys.forEach((key) => {
        data[key] = editorProfile[key];
    });

    // 更新助手配置
    patchUserAgentProfileRequest(data)
        .then(() => {
            toast.success("助手配置更新成功");
            userStore.refreshUserInfo();
        })
        .catch(() => {
            toast.error("助手配置更新失败");
        });
}

onMounted(() => {
    Object.assign(editorProfile, savedProfile.value);
});
</script>

<style scoped>
.agent-profile {
    width: 100%;
    height: 100%;
    padding: 35px 16px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 50px;
}

.agent-profile-card {
    max-width: 560px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.agent-profile-card-item {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    gap: 8px;
    border: 1px solid var(--ch-border-divider-color);
    background-color: var(--ch-feature-card-bg);
    padding: 12px;
    border-radius: 8px;
}

.agent-profile-card-item-label {
    font-size: 14px;
    font-weight: 700;
}

.agent-profile-card-item-input {
    width: 100%;
    font-size: 16px;
    flex: 1 1;
}

.agent-profile-card-item-input-textarea {
    flex: none;
    min-height: 120px;
    max-height: 240px;
    resize: none;
    overflow-y: auto;
    overflow-x: hidden;
}

.agent-profile-btn {
    max-width: 560px;
    width: 100%;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--ch-main-color);
    font-size: 16px;
    font-weight: 600;
    color: var(--ch-text-white-color);
    user-select: none;
}

.agent-profile-btn:hover {
    background-color: var(--ch-main-hover-color);
}
</style>
