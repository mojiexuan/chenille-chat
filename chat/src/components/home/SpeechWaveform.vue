<template>
    <div ref="containerRef" class="speech-waveform" :style="{ height: `${height}px` }">
        <div v-for="(bar, index) in bars" :key="index" class="bar" :style="{
            width: `${barWidth}px`,
            height: `${bar}px`,
        }" />
    </div>
</template>

<script setup lang="ts">
import {
    onMounted,
    onUnmounted,
    ref,
    watch,
} from "vue";

interface Props {
    volume: number; // 0~1
    height?: number;
    barWidth?: number;
    gap?: number;
    minBarHeight?: number;
    maxBarHeightRatio?: number;
    fps?: number;
}

const props = withDefaults(
    defineProps<Props>(),
    {
        height: 40,
        barWidth: 3,
        gap: 4,
        minBarHeight: 2,
        maxBarHeightRatio: 0.9,
        fps: 20,
    },
);

const containerRef = ref<HTMLDivElement>();
const bars = ref<number[]>([]);
let resizeObserver: ResizeObserver | null = null;
let timer: number | null = null;
let smoothVolume = 0;

function rebuildBars() {
    const container = containerRef.value;
    if (!container) {
        return;
    }
    const width = container.clientWidth;
    const count = Math.max(
        1,
        Math.floor(
            width /
            (props.barWidth + props.gap),
        ),
    );
    bars.value = Array(count).fill(
        props.minBarHeight,
    );
}

watch(
    () => props.volume,
    (volume) => {
        smoothVolume =
            smoothVolume * 0.85 +
            volume * 0.15;
    },
);

function start() {
    const interval =
        1000 / props.fps;
    timer = window.setInterval(() => {
        if (!bars.value.length) {
            return;
        }
        const boosted = Math.pow(Math.min(smoothVolume * 3, 1), 0.55);
        const maxHeight =
            props.height *
            props.maxBarHeightRatio;
        const nextHeight =
            props.minBarHeight +
            boosted *
            (maxHeight -
                props.minBarHeight);
        const nextBars = [...bars.value];
        nextBars.shift();
        nextBars.push(nextHeight);
        bars.value = nextBars;
    }, interval);
}

onMounted(() => {
    rebuildBars();
    resizeObserver =
        new ResizeObserver(() => {
            rebuildBars();
        });
    if (containerRef.value) {
        resizeObserver.observe(
            containerRef.value,
        );
    }
    start();
});

onUnmounted(() => {
    resizeObserver?.disconnect();
    if (timer) {
        clearInterval(timer);
    }
});
</script>

<style scoped>
.speech-waveform {
    width: 100%;
    display: flex;
    align-items: center;
    gap: v-bind('`${gap}px`');
    overflow: hidden;
}

.bar {
    flex-shrink: 0;
    min-height: 2px;
    border-radius: 999px;
    background: currentColor;
    transition: height 80ms ease-out;
}
</style>