import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';

/**
 * 媒体查询
 * @param query 媒体查询语句，例如 '(min-width: 768px)'
 * @returns 是否匹配的响应式状态
 */
export function useMediaQuery(query: string): Ref<boolean> {
    const matches = ref(false);
    let mediaQueryList: MediaQueryList | null = null;

    /**
     * 媒体查询结果变化回调
     */
    function handleChange(event: MediaQueryListEvent) {
        matches.value = event.matches;
    }

    onMounted(() => {
        mediaQueryList = window.matchMedia(query);
        matches.value = mediaQueryList.matches;
        mediaQueryList.addEventListener('change', handleChange);
    });

    onBeforeUnmount(() => {
        mediaQueryList?.removeEventListener('change', handleChange);
        mediaQueryList = null;
    });

    return matches;
}

/**
 * 是否为大屏（等价于 @media screen and (min-width: 768px)）
 * @param breakpoint 断点宽度，默认 768
 */
export function useIsDesktop(breakpoint: number = 768): Ref<boolean> {
    return useMediaQuery(`(min-width: ${breakpoint}px)`);
}
