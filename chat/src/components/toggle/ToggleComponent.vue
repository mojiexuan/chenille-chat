<template>
    <div class="toggle">
        <label class="toggle-label">
            <input type="checkbox" class="toggle-input" :checked="modelValue" @change="handleToggle">
        </label>
    </div>
</template>

<script setup lang="ts" name="Toggle">
/**
 * 开关组件
 */
defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
})

/**
 * 开关切换事件
 */
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
}>();

/**
 * 开关切换事件
 */
function handleToggle(e: Event) {
    emit('update:modelValue', (e.target as HTMLInputElement).checked);
}
</script>

<style scoped>
.toggle {
    display: flex;
    align-items: center;
    gap: 12px;
}

.toggle-input {
    display: none;
}

/* 开关轨道 */
.toggle-label {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
    background: #ccc;
    border-radius: 28px;
    cursor: pointer;
    transition: background 0.3s ease;
}

/* 开关滑块 */
.toggle-label::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: var(--ch-white-bg-black);
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 选中状态：轨道变色，滑块右移 */
.toggle-label:has(.toggle-input:checked) {
    background: var(--ch-main-color);
}

.toggle-label:has(.toggle-input:checked)::after {
    transform: translateX(24px);
}
</style>