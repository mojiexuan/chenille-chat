import { reactive } from 'vue';

export type IconType = 'success' | 'prompt' | 'warning' | 'error' | 'loading';

/**
 * Toast 共享状态
 */
export const toastState = reactive({
    visible: false,
    message: '成功',
    icon: 'success' as IconType,
    duration: 3000,
});

/** 定时器 */
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * 隐藏 Toast（供组件和外部调用）
 */
export function hideToast(): void {
    toastState.visible = false;
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}

/**
 * 全局使用的 Toast composable
 *
 * @example
 * const toast = useToast();
 * toast.show('操作成功', 'success');
 * toast.show('请求失败', 'error');
 *
 * @author 陈佳宝
 * @date 2026-01-23
 */
export function useToast() {
    /**
     * 展示 Toast
     */
    function show(
        message = '成功',
        icon: IconType = 'success',
        duration = 3000,
    ): void {
        hideToast();

        toastState.message = message;
        toastState.icon = icon;
        toastState.duration = duration;
        toastState.visible = true;

        timer = setTimeout(() => {
            hideToast();
        }, duration);
    }

    function success(message = '成功', duration = 3000) {
        show(message, 'success', duration)
    }

    function prompt(message = '提示', duration = 3000) {
        show(message, 'prompt', duration)
    }

    function warning(message = '警告', duration = 3000) {
        show(message, 'warning', duration)
    }

    function error(message = '错误', duration = 3000) {
        show(message, 'error', duration)
    }

    return {
        show,
        hide: hideToast,
        success,
        prompt,
        warning,
        error,
    };
}