import { ref } from 'vue';

/**
 * Auth 共享状态
 */
export const visible = ref(false);

/**
 * 全局使用的 Auth composable
 *
 * @author 陈佳宝
 * @date 2026--05-17
 */
export function useAuth() {
    /**
     * 展示 Auth
     */
    function show(): void {
        hide();
        visible.value = true;
    }

    /**
     * 隐藏 Auth
     */
    function hide(): void {
        visible.value = false;
    }

    return {
        show,
        hide,
    };
}