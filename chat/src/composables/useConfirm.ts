import { reactive } from 'vue';

export type ConfirmIconType = 'success' | 'prompt' | 'warning' | 'error';

export type ConfirmOptions = {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    showCancelButton?: boolean;
    icon: ConfirmIconType;
    onConfirm?: (e: MouseEvent) => void;
    onCancel?: (e: MouseEvent) => void;
};

export type ConfirmOptionsNoIcon = Omit<ConfirmOptions, 'icon'>;

/**
 * Confirm 共享状态
 */
export const confirmState = reactive<ConfirmOptions & { visible: boolean }>({
    visible: false,
    title: '确认操作吗？',
    message: undefined,
    confirmText: '确认',
    cancelText: '取消',
    showCancelButton: true,
    icon: 'prompt' as ConfirmIconType,
});

export function useConfirm() {
    /**
     * 展示 Confirm
     */
    function show(options: ConfirmOptions) {
        Object.assign(confirmState, options);
        confirmState.visible = true;
    }

    /**
     * 确认操作
     */
    function success(options: ConfirmOptionsNoIcon) {
        Object.assign(confirmState, options);
        confirmState.visible = true;
        confirmState.icon = 'success' as ConfirmIconType;
    }

    /**
     * 提示操作
     */
    function prompt(options: ConfirmOptionsNoIcon) {
        Object.assign(confirmState, options);
        confirmState.visible = true;
        confirmState.icon = 'prompt' as ConfirmIconType;
    }

    /**
     * 警告操作
     */
    function warning(options: ConfirmOptionsNoIcon) {
        Object.assign(confirmState, options);
        confirmState.visible = true;
        confirmState.icon = 'warning' as ConfirmIconType;
    }

    /**
     * 错误操作
     */
    function error(options: ConfirmOptionsNoIcon) {
        Object.assign(confirmState, options);
        confirmState.visible = true;
        confirmState.icon = 'error' as ConfirmIconType;
    }

    return {
        show,
        success,
        prompt,
        warning,
        error,
    };
}