import type { Directive } from 'vue';

const handlerMap = new WeakMap<HTMLElement, (event: MouseEvent) => void>();

/**
 * 点击外部关闭（全局指令用法 v-click-outside）
 */
export const vClickOutsideDirective: Directive<HTMLElement, (event: MouseEvent) => void> = {
    mounted(el, binding) {
        const handler = (event: MouseEvent) => {
            if (!el.contains(event.target as Node)) {
                binding.value(event);
            }
        };
        handlerMap.set(el, handler);
        document.addEventListener('click', handler, true);
    },
    unmounted(el) {
        const handler = handlerMap.get(el);
        if (handler) {
            document.removeEventListener('click', handler, true);
            handlerMap.delete(el);
        }
    },
};