<template>
    <Teleport to="body">
        <Transition name="context-pop">
            <div v-if="visible" :key="String(isReady)" ref="menuRef" v-click-outside="handlerClose"
                :style="{ ...menuStyle, transformOrigin }" class="context-menu" :class="{
                    'context-menu-measuring': !isReady
                }">
                <slot></slot>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts" name="name">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

type Quadrant = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface Anchor {
    x: number;
    y: number;
}

const props = withDefaults(defineProps<{
    visible: boolean;
    anchor: Anchor;
    offset?: number;
}>(), {
    offset: 8,
});

const emit = defineEmits<{
    close: [];
}>();

// 菜单元素引用
const menuRef = ref<HTMLElement | null>(null);
// 菜单位置
const quadrant = ref<Quadrant>('bottom-right');
// 菜单宽度
const measuredWidth = ref(0);
// 菜单高度
const measuredHeight = ref(0);
// 是否准备就绪
const isReady = ref(false);

/**
 * 计算菜单单位置
 */
function calcQuadrant() {
    // 锚点位置
    const { x, y } = props.anchor;
    // 菜单宽度
    const w = measuredWidth.value;
    // 菜单高度
    const h = measuredHeight.value;
    // 窗口宽度
    const vw = window.innerWidth;
    // 窗口高度
    const vh = window.innerHeight;

    // 是否有空间显示在右侧
    const hasRight = vw - x >= w;
    // 是否有空间显示在左侧
    const hasLeft = x >= w;
    // 是否有空间显示在下方
    const hasBelow = vh - y >= h;
    // 是否有空间显示在上方
    const hasAbove = y >= h;

    // 判断菜单位置
    if (hasBelow && hasRight) { quadrant.value = 'bottom-right'; return; }
    if (hasBelow && hasLeft) { quadrant.value = 'bottom-left'; return; }
    if (hasAbove && hasRight) { quadrant.value = 'top-right'; return; }
    if (hasAbove && hasLeft) { quadrant.value = 'top-left'; return; }

    // 计算每个菜单位置的分数
    const scores: [Quadrant, number][] = [
        ['bottom-right', Math.min((vw - x) / w, (vh - y) / h)],
        ['bottom-left', Math.min(x / w, (vh - y) / h)],
        ['top-right', Math.min((vw - x) / w, y / h)],
        ['top-left', Math.min(x / w, y / h)],
    ];

    // 选择分数最高的菜单位置
    quadrant.value = scores.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'bottom-right';
}

// 监听 visible 变化
watch(() => props.visible, async (show) => {
    // 如果菜单可见，计算菜单位置
    if (show) {
        // 等待菜单元素渲染完成
        isReady.value = false;
        await nextTick();
        // 获取菜单元素
        const el = menuRef.value;
        if (el) {
            // 计算菜单宽度和高度
            measuredWidth.value = el.offsetWidth;
            measuredHeight.value = el.offsetHeight;
            // 计算菜单位置
            calcQuadrant();
            // 标记为准备就绪
            isReady.value = true;
        }
    }
});

// 监听键盘事件
function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        emit('close');
    }
}

/**
 * 关闭菜单
 */
function handlerClose() {
    emit('close');
}

onMounted(() => {
    // 监听键盘事件
    document.addEventListener('keydown', handleKeydown);
})

onBeforeUnmount(() => {
    // 移除键盘事件监听
    document.removeEventListener('keydown', handleKeydown);
})

window.addEventListener('resize', () => {
    if (props.visible) {
        const el = menuRef.value;
        if (el) {
            // 获取菜单元素宽度和高度
            measuredWidth.value = el.offsetWidth;
            measuredHeight.value = el.offsetHeight;
        }
        // 计算菜单位置
        calcQuadrant();
    }
});

/**
 * 计算菜单样式
 * @returns 菜单样式
 */
const menuStyle = computed(() => {
    const { x, y } = props.anchor;
    const o = props.offset;
    const w = measuredWidth.value;
    const h = measuredHeight.value;

    // 如果菜单未渲染完成，返回隐藏样式
    if (!isReady.value) {
        return {
            position: 'fixed' as const,
            top: `${y + o}px`,
            left: `${x + o}px`,
            transformOrigin: transformOrigin.value,
        };
    }

    // 根据菜单位置计算菜单样式
    switch (quadrant.value) {
        case 'bottom-right': return { position: 'fixed' as const, top: `${y + o}px`, left: `${x + o}px`, transformOrigin: transformOrigin.value };
        case 'bottom-left': return { position: 'fixed' as const, top: `${y + o}px`, left: `${x - w - o}px`, transformOrigin: transformOrigin.value };
        case 'top-right': return { position: 'fixed' as const, top: `${y - h - o}px`, left: `${x + o}px`, transformOrigin: transformOrigin.value };
        default: return { position: 'fixed' as const, top: `${y - h - o}px`, left: `${x - w - o}px`, transformOrigin: transformOrigin.value };
    }
});

/**
 * 计算菜单变换原点
 * @returns 菜单变换原点
 */
const transformOrigin = computed(() => {
    // 根据菜单位置计算菜单变换原点
    switch (quadrant.value) {
        case 'bottom-right': return '0 0';
        case 'bottom-left': return '100% 0';
        case 'top-right': return '0 100%';
        default: return '100% 100%';
    }
});
</script>

<style scoped>
.context-menu {
    z-index: 9999;
    background: transparent;
    border-radius: 10px;
    min-width: 160px;
    will-change: transform, opacity;
}

.context-pop-enter-active {
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.context-pop-leave-active {
    transition: all 0.15s ease-in;
}

.context-pop-enter-from,
.context-pop-leave-to {
    opacity: 0;
    transform: scale(0.6);
}

.context-menu-measuring {
    opacity: 0 !important;
    pointer-events: none;
}
</style>