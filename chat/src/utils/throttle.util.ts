type Timing = {
    leading?: boolean;
    trailing?: boolean;
};

interface ThrottleFunction<TArgs extends unknown[], TResult> {
    (...args: TArgs): TResult | undefined;
    cancel: () => void;
}

/**
 * 节流函数
 * 支持 leading（立即执行第一次）和 trailing（延迟执行最后一次）
 * 
 * @author 陈佳宝
 * @date 2026-02-01
 */
const throttle = <TArgs extends unknown[], TResult>(
    func: (...args: TArgs) => TResult,
    delay: number,
    timing: Timing = { leading: true }
): ThrottleFunction<TArgs, TResult> => {
    // 定时器
    let timer: ReturnType<typeof setTimeout> | undefined;

    // 最后一次执行时间
    let lastExec = 0;

    // 最后一次参数
    let lastArgs: TArgs | null = null;

    // 返回值缓存
    let result: TResult | undefined;

    const throttled = (...args: TArgs): TResult | undefined => {
        const now = Date.now();

        // 首次调用且不需要 leading
        if (!lastExec && timing.leading === false) {
            lastExec = now;
        }

        const remaining = delay - (now - lastExec);

        lastArgs = args;

        // 可以立即执行
        if (remaining <= 0 || remaining > delay) {
            if (timer) {
                clearTimeout(timer);
                timer = undefined;
            }

            result = func(...args);

            lastExec = now;

            lastArgs = null;

            return result;
        }

        // 安排 trailing 执行
        if (
            timing.trailing !== false &&
            !timer
        ) {
            timer = setTimeout(() => {
                timer = undefined;

                lastExec =
                    timing.leading === false
                        ? 0
                        : Date.now();

                if (lastArgs) {
                    result = func(...lastArgs);
                    lastArgs = null;
                }
            }, remaining);
        }

        return result;
    };

    // 取消
    throttled.cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = undefined;
        }

        lastExec = 0;
        lastArgs = null;
    };

    return throttled;
};

export default throttle;