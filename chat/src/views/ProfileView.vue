<template>
    <div class="profile">
        <img class="profile-avatar" :src="userStore.user.avatar" :alt="userStore.user.nickname" />
        <div class="profile-info">
            <div class="profile-info-item">
                <span class="profile-info-item-label">昵称</span>
                <input class="profile-info-item-input" type="text" v-model="editorUserNickname" placeholder="请输入昵称"
                    maxlength="20" minlength="1" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="profile">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores';

// 用户store
const userStore = useUserStore();

// 编辑器用户昵称
const editorUserNickname = ref("");

onMounted(() => {
    editorUserNickname.value = userStore.user.nickname || "";
});
</script>

<style scoped>
.profile {
    width: 100%;
    height: 100%;
    padding: 35px 0 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 50px;
}

.profile-avatar {
    width: 88px;
    max-width: 88px;
    min-width: 88px;
    height: 88px;
    max-height: 88px;
    min-height: 88px;
    border-radius: 50%;
}

.profile-info {
    max-width: 560px;
    width: 100%;
    height: 48px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.profile-info-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    border: 1px solid var(--ch-border-divider-color);
    background-color: var(--ch-feature-card-bg);
    padding: 12px;
    border-radius: 8px;
}

.profile-info-item-label {
    font-size: 14px;
    font-weight: 700;
}

.profile-info-item-input {
    font-size: 16px;
    flex: 1 1;
}
</style>