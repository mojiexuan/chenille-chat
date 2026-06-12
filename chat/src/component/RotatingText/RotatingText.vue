<script setup lang="ts">
import { AnimatePresence, Motion } from 'motion-v';
import type { MotionProps } from 'motion-v';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

type StaggerFrom = 'first' | 'last' | 'center' | 'random' | number;
type SplitBy = 'characters' | 'words' | 'lines';

type TransitionType = NonNullable<MotionProps['transition']>;
type InitialType = NonNullable<MotionProps['initial']>;
type AnimateType = NonNullable<MotionProps['animate']>;
type ExitType = NonNullable<MotionProps['exit']>;

interface WordElement {
  characters: string[];
  needsSpace: boolean;
}

interface RotatingTextProps {
  /** 要轮播的文字数组 */
  texts: string[];
  /** 进出场过渡动画配置 */
  transition?: TransitionType;
  /** 入场初始状态（如 y:'100%' opacity:0） */
  initial?: InitialType;
  /** 显示态（通常 y:0 opacity:1） */
  animate?: AnimateType;
  /** 离场态（通常 y:'-120%' opacity:0） */
  exit?: ExitType;
  /** AnimatePresence 模式：'sync' 新旧同时存在 'wait' 旧出完新再进 */
  animatePresenceMode?: 'sync' | 'wait';
  /** 首次渲染时是否播放入场动画 */
  animatePresenceInitial?: boolean;
  /** 自动轮播间隔（毫秒） */
  rotationInterval?: number;
  /** 逐字错开动画的延迟基数（毫秒），0 则同时出现 */
  staggerDuration?: number;
  /** 错开动画起始方向：'first' 从头 'last' 从尾 'center' 从中间 'random' 随机 */
  staggerFrom?: StaggerFrom;
  /** 播到最后一条是否循环回第一条 */
  loop?: boolean;
  /** 是否自动轮播 */
  auto?: boolean;
  /** 拆分方式：'characters' 逐字 'words' 逐词 'lines' 逐行 */
  splitBy?: SplitBy;
  /** 切换到第 index 条时的回调 */
  onNext?: (index: number) => void;
  /** 最外层容器额外 class */
  mainClassName?: string;
  /** 拆分层级容器额外 class */
  splitLevelClassName?: string;
  /** 单个字符/词元素额外 class */
  elementLevelClassName?: string;
}

const cn = (...classes: (string | undefined | null | boolean)[]): string => {
  return classes.filter(Boolean).join(' ');
};

const props = withDefaults(defineProps<RotatingTextProps>(), {
  transition: () =>
    ({
      type: 'spring',
      damping: 25,
      stiffness: 300
    }) as TransitionType,
  initial: () => ({ y: '100%', opacity: 0 }) as InitialType,
  animate: () => ({ y: 0, opacity: 1 }) as AnimateType,
  exit: () => ({ y: '-120%', opacity: 0 }) as ExitType,
  animatePresenceMode: 'wait',
  animatePresenceInitial: false,
  rotationInterval: 2000,
  staggerDuration: 0,
  staggerFrom: 'first',
  loop: true,
  auto: true,
  splitBy: 'characters'
});

const currentTextIndex = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

const splitIntoCharacters = (text: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const IntlWithSegmenter = Intl as typeof Intl & {
      Segmenter: new (
        locales?: string | string[],
        options?: { granularity: 'grapheme' | 'word' | 'sentence' }
      ) => {
        segment: (text: string) => Iterable<{ segment: string }>;
      };
    };
    const segmenter = new IntlWithSegmenter.Segmenter('en', { granularity: 'grapheme' });
    return [...segmenter.segment(text)].map(({ segment }) => segment);
  }

  return [...text];
};
const elements = computed((): WordElement[] => {
  const currentText = props.texts[currentTextIndex.value];

  switch (props.splitBy) {
    case 'characters': {
      const words = currentText?.split(' ') || [];
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1
      }));
    }
    case 'words': {
      const words = currentText?.split(' ') || [];
      return words.map((word, i) => ({
        characters: [word],
        needsSpace: i !== words.length - 1
      }));
    }
    case 'lines': {
      const lines = currentText?.split('\n') || [];
      return lines.map((line, i) => ({
        characters: [line],
        needsSpace: i !== lines.length - 1
      }));
    }
    default: {
      const parts = currentText?.split(props.splitBy!) || [];
      return parts.map((part, i) => ({
        characters: [part],
        needsSpace: i !== parts.length - 1
      }));
    }
  }
});

const getStaggerDelay = (index: number, totalChars: number): number => {
  const { staggerDuration, staggerFrom } = props;

  switch (staggerFrom) {
    case 'first':
      return index * staggerDuration;
    case 'last':
      return (totalChars - 1 - index) * staggerDuration;
    case 'center': {
      const center = Math.floor(totalChars / 2);
      return Math.abs(center - index) * staggerDuration;
    }
    case 'random': {
      const randomIndex = Math.floor(Math.random() * totalChars);
      return Math.abs(randomIndex - index) * staggerDuration;
    }
    default:
      return Math.abs((staggerFrom as number) - index) * staggerDuration;
  }
};

const handleIndexChange = (newIndex: number): void => {
  currentTextIndex.value = newIndex;
  props.onNext?.(newIndex);
};

const next = (): void => {
  const isAtEnd = currentTextIndex.value === props.texts.length - 1;
  const nextIndex = isAtEnd ? (props.loop ? 0 : currentTextIndex.value) : currentTextIndex.value + 1;

  if (nextIndex !== currentTextIndex.value) {
    handleIndexChange(nextIndex);
  }
};

const previous = (): void => {
  const isAtStart = currentTextIndex.value === 0;
  const prevIndex = isAtStart
    ? props.loop
      ? props.texts.length - 1
      : currentTextIndex.value
    : currentTextIndex.value - 1;

  if (prevIndex !== currentTextIndex.value) {
    handleIndexChange(prevIndex);
  }
};

const jumpTo = (index: number): void => {
  const validIndex = Math.max(0, Math.min(index, props.texts.length - 1));
  if (validIndex !== currentTextIndex.value) {
    handleIndexChange(validIndex);
  }
};

const reset = (): void => {
  if (currentTextIndex.value !== 0) {
    handleIndexChange(0);
  }
};

const cleanupInterval = (): void => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const startInterval = (): void => {
  if (props.auto) {
    intervalId = setInterval(next, props.rotationInterval);
  }
};

defineExpose({
  next,
  previous,
  jumpTo,
  reset
});

watch(
  () => [props.auto, props.rotationInterval] as const,
  () => {
    cleanupInterval();
    startInterval();
  }
);

onMounted(() => {
  startInterval();
});

onUnmounted(() => {
  cleanupInterval();
});
</script>

<template>
  <Motion tag="span" :class="cn('rotating-text', mainClassName)" v-bind="$attrs" :transition="transition" layout>
    <span class="rotating-text-sr">
      {{ texts[currentTextIndex] }}
    </span>

    <AnimatePresence :mode="animatePresenceMode" :initial="animatePresenceInitial">
      <Motion :key="currentTextIndex" tag="span"
        :class="cn(splitBy === 'lines' ? 'rotating-text-line' : 'rotating-text-word', splitLevelClassName)"
        aria-hidden="true" layout>
        <span v-for="(wordObj, wordIndex) in elements" :key="wordIndex"
          :class="cn('rotating-text-word-inner', splitLevelClassName)">
          <Motion v-for="(char, charIndex) in wordObj.characters" :key="charIndex" tag="span" :initial="initial"
            :animate="animate" :exit="exit" :transition="{
              ...transition,
              delay: getStaggerDelay(
                elements.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0) + charIndex,
                elements.reduce((sum, word) => sum + word.characters.length, 0)
              )
            }" :class="cn('rotating-text-char', elementLevelClassName)">
            {{ char }}
          </Motion>
          <span v-if="wordObj.needsSpace" class="rotating-text-space"></span>
        </span>
      </Motion>
    </AnimatePresence>
  </Motion>
</template>

<style scoped>
.rotating-text {
  display: flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  position: relative;
  overflow: hidden;
}

.rotating-text-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rotating-text-line {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.rotating-text-word {
  display: flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  position: relative;
}

.rotating-text-word-inner {
  display: inline-flex;
}

.rotating-text-char {
  display: inline-block;
}

.rotating-text-space {
  white-space: pre;
}
</style>
