<template>
  <div class="profile">
    <div class="profile-avatar">
      <img class="profile-avatar-image" :src="userStore.user.avatar" :alt="userStore.user.nickname" />
      <input class="profile-avatar-input" type="file" accept="image/*" @change="handleAvatarClick" />
    </div>
    <div class="profile-info">
      <div class="profile-info-item">
        <span class="profile-info-item-label">昵称</span>
        <input class="profile-info-item-input" type="text" v-model="editorUserNickname" placeholder="请输入昵称"
          maxlength="20" minlength="1" />
      </div>
    </div>
    <button class="profile-btn" @click="handleSaveClick">保存</button>
    <CropperComponent v-if="showCropper" :file="cropperFile!" @close="showCropper = false"
      @confirm="handleCropConfirmClick">
    </CropperComponent>
  </div>
</template>

<script setup lang="ts" name="profile">
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores";
import { useToast, useConfirm } from "@/composables";
import { updateUserAvatarRequest, patchUserInfoRequest } from "@/request";
import CropperComponent from "@/components/cropper/CropperComponent.vue";

// 用户store
const userStore = useUserStore();

// 编辑器用户昵称
const editorUserNickname = ref("");

// 提示
const toast = useToast();
// 确认
const confirm = useConfirm();

// 显示裁剪组件
const showCropper = ref(false);
// 裁剪文件
const cropperFile = ref<File>();

/**
 * 点击头像触发上传
 */
function handleAvatarClick(e: Event) {
  e.stopPropagation();
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    toast.prompt("请选择图片");
    return;
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    confirm.error({
      title: "图片格式错误",
      message: "请上传JPEG、PNG、GIF、WEBP格式的图片",
      confirmText: "知道了",
    });
    target.value = "";
    return;
  }
  // 限制文件大小为2MB
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error("图片大小超过2MB");
    target.value = "";
    return;
  }

  const img = new Image();
  img.onload = () => {
    const maxResolution = 2048;
    if (img.width > maxResolution || img.height > maxResolution) {
      toast.error("图片分辨率超过2048");
      target.value = "";
      return;
    }
    // 校验通过，裁剪头像
    cropperFile.value = file;
    showCropper.value = true;
  }
  img.onerror = () => {
    toast.error("图片加载失败");
    target.value = "";
    return;
  }
  img.src = URL.createObjectURL(file);
}

/**
 * 裁剪确认点击
 */
function handleCropConfirmClick(blob: Blob) {
  // 转换为File对象
  const file = new File([blob], "avatar.png", { type: blob.type });
  // 关闭裁剪组件
  showCropper.value = false;
  // 更新用户头像
  updateUserAvatarRequest(file)
    .then(() => {
      toast.success("头像更新成功");
      userStore.refreshUserInfo();
    })
    .catch(() => {
      toast.error("头像更新失败");
    });
}

/**
 * 保存点击
 */
function handleSaveClick() {
  if (editorUserNickname.value === userStore.user.nickname) {
    return;
  }
  if (editorUserNickname.value.length < 1 || editorUserNickname.value.length > 20) {
    toast.error("昵称长度必须在1-20之间");
    return;
  }
  // 更新用户信息
  patchUserInfoRequest({ nickname: editorUserNickname.value })
    .then(() => {
      toast.success("昵称更新成功");
      userStore.refreshUserInfo();
    })
    .catch(() => {
      toast.error("昵称更新失败");
    });
}

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
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
}

.profile-avatar-image {
  width: 88px;
  max-width: 88px;
  min-width: 88px;
  height: 88px;
  max-height: 88px;
  min-height: 88px;
  border-radius: 50%;
}

.profile-avatar-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
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

.profile-btn {
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
}

.profile-btn:hover {
  background-color: var(--ch-main-hover-color);
}
</style>
