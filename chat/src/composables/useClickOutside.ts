import { onBeforeUnmount, onMounted } from 'vue';
import type { Ref } from 'vue';

/**
 * 点击外部关闭弹窗
 * @param target 目标元素
 * @param callback 回调函数
 */
export function useClickOutside(target: Ref<HTMLElement | null>, callback: () => void) {
    /**
     * 点击外部关闭弹窗事件
     */
    function handleClick(event: MouseEvent) {
        const el = target.value;
        if (!el) return;
        if (!el.contains(event.target as Node)) {
            callback();
        }
    }

    /**
     * 组件挂载时添加事件监听
     */
    onMounted(() => {
        document.addEventListener('click', handleClick, true);
    });

    /**
     * 组件卸载时移除事件监听
     */
    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClick, true);
    });
}