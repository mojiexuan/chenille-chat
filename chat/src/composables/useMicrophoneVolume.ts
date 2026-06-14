import {
    onUnmounted,
    ref,
} from "vue";

/**
 * 监听麦克风音量
 */
export function useMicrophoneVolume(
    analyser: AnalyserNode,
    fps = 20,
) {
    const volume = ref(0);
    const data = new Uint8Array(
        analyser.frequencyBinCount,
    );
    function calculateVolume() {
        analyser.getByteTimeDomainData(
            data,
        );

        let sum = 0;

        for (let i = 0; i < data.length; i++) {
            const normalized =
                (data[i]! - 128) / 128;

            sum +=
                normalized * normalized;
        }

        return Math.sqrt(
            sum / data.length,
        );
    }

    const timer = window.setInterval(
        () => {
            volume.value =
                calculateVolume();
        },
        1000 / fps,
    );

    onUnmounted(() => {
        clearInterval(timer);
    });

    return {
        volume,
    };
}