<template>
    <div ref="rootRef" class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts" name="MarkdownRenderer">
// https://mdit-plugins.github.io/zh/
import MarkdownItAsync from 'markdown-it-async';
import type {
    MarkdownItAsync as MarkdownIt,
} from "markdown-it-async";
import { codeToHtml } from 'shiki';
import type { ShikiTransformer } from 'shiki';
import {
    transformerNotationDiff,
    transformerNotationHighlight,
    transformerNotationWordHighlight,
    transformerNotationFocus,
    transformerNotationErrorLevel,
    transformerMetaHighlight,
    transformerRenderWhitespace,
    transformerMetaWordHighlight,
    transformerRemoveNotationEscape,
} from "@shikijs/transformers";
import markdownitsub from "markdown-it-sub";
import markdownitsup from "markdown-it-sup";
import markdownitfootnote from "markdown-it-footnote";
import markdownitdeflist from "markdown-it-deflist";
import markdownitabbr from "markdown-it-abbr";
import { full as markdownitemoji } from "markdown-it-emoji";
import markdownitcontainer from "markdown-it-container";
import markdownitins from "markdown-it-ins";
import markdownitmark from "markdown-it-mark";
import markdownitanchor from "markdown-it-anchor";
import markdownittocdoneright from "markdown-it-toc-done-right";
import markdownitattrs from "markdown-it-attrs";
import { alert as markdownitalert } from "@mdit/plugin-alert";
import { figure as markdownitfigure } from "@mdit/plugin-figure";
import { imgLazyload as markdownitImgLazyload } from "@mdit/plugin-img-lazyload";
import { imgSize, obsidianImgSize } from "@mdit/plugin-img-size";
import { katex as markdownitkatex } from "@mdit/plugin-katex";
import { plantuml as markdownitplantuml } from "@mdit/plugin-plantuml";
import { ruby as markdownitruby } from "@mdit/plugin-ruby";
import { spoiler as markdownitspoiler } from "@mdit/plugin-spoiler";
import { tasklist as markdownittasklist } from "@mdit/plugin-tasklist";
import type { MarkdownItContainerTokenType } from "@/types";
import { watch, ref, nextTick, onMounted } from 'vue';
import { copyTextToClipboard, debounce } from '@/utils';
import { useToast,useConfirm } from '@/composables';

// 组件根元素
const rootRef = ref<HTMLElement>();

// 初始化toast
const toast = useToast();
// 初始化确认弹窗
const confirm = useConfirm();

/**
 * 定义组件属性
 */
const props = defineProps({
    content: {
        type: String,
        required: true,
    }
});

// 代码行高亮
const codeHighlightedTransformer: ShikiTransformer = {
    name: "codeHighlightedTransformer",
    code(node) {
        if (node.children.length > 0) {
            if (
                (
                    node.children[node.children.length - 1] as {
                        children: { type: string; value: string }[];
                    }
                ).children.length === 0
            ) {
                node.children.pop();
            }
        }
    },
};

const alertTitleMap: Record<string, string> = {
    info: "信息",
    note: "注",
    warning: "警告",
    tip: "提示",
    danger: "危险",
    details: "详情",
    caution: "危险",
    important: "重要",
};

/**
 * 添加自定义容器
 */
const addCustomContainer = (
    md: MarkdownIt,
    container: { name: string; title: string }[],
) => {
    container.forEach((item) => {
        md.use(markdownitcontainer, item.name, {
            render: function (tokens: MarkdownItContainerTokenType[], idx: number) {
                const m = tokens[idx]?.info.split(" ") || [];
                if (tokens[idx]?.nesting === 1) {
                    return `<div class="custom-container custom-container-${item.name
                        }"><div class="custom-container-title">${m.length > 2 ? md.utils.escapeHtml(m[2] || "") : item.title
                        }</div>\n`;
                } else {
                    return "</div>\n";
                }
            },
        });
    });
};

const md = MarkdownItAsync("default", {
    html: true, // 可以识别html
    xhtmlOut: true,
    breaks: true, // 回车换行
    langPrefix: "language-",
    linkify: true, // 自动检测链接文本
    typographer: true, // 优化排版，标点
    quotes: "“”‘’",
    highlight: async function (code, lang) {
        const codeHtml = await codeToHtml(code, {
            lang,
            themes: {
                dark: "min-dark",
                light: "min-light",
            },
            defaultColor: false,
            transformers: [
                codeHighlightedTransformer,
                transformerNotationDiff(),
                transformerNotationHighlight(),
                transformerNotationWordHighlight(),
                transformerNotationFocus(),
                transformerNotationErrorLevel(),
                transformerMetaHighlight(),
                transformerRenderWhitespace(),
                transformerMetaWordHighlight(),
                transformerRemoveNotationEscape(),
            ],
        });
        return getPre(lang, code, codeHtml);
    }
})
    .use(markdownitsub) // 下标
    .use(markdownitalert, {
        deep: true,
        titleRender: (tokens, idx) => {
            const token = tokens[idx];
            if (!token) {
                return "";
            }
            const content = token.content.trim();
            return `<div class="markdown-alert-title">${alertTitleMap[content] || content
                }</div>`;
        },
    }) // GFM 风格的警告
    .use(markdownitsup) // 上标
    .use(markdownitfootnote) // 脚注
    .use(markdownitdeflist) // 定义列表
    .use(markdownitabbr) // 缩写
    .use(markdownitemoji) // 表情
    .use(markdownitins) // 插入
    .use(markdownitmark) // 标记
    .use(markdownitfigure) // 标题图片
    .use(markdownitanchor, {
        permalink: markdownitanchor.permalink.headerLink({
            safariReaderFix: true,
            class: "header-anchor",
        }),
    }) // 标题锚点
    .use(markdownitImgLazyload) // 图片懒加载
    .use(imgSize) // 新格式 图片尺寸
    .use(obsidianImgSize) // Obsidian 格式 图片尺寸
    .use(markdownitkatex) // 公式
    .use(markdownitplantuml) // uml
    .use(markdownitruby) // ruby拼音
    .use(markdownitspoiler) // 隐藏内容
    .use(markdownittasklist) // 任务列表
    .use(markdownittocdoneright, {
        containerClass: "article-outline-of-contents",
        linkClass: "article-outline-link",
    }) // 目录
    .use(markdownitattrs, {
        leftDelimiter: "{",
        rightDelimiter: "}",
        allowedAttributes: ["id", "class", "style", "data-*", "title", "target"], // 为空数组时支持所有属性，当然这是不安全的
    }) // 属性{}
// .use(apiDocuPlugin) // 接口文档
// .use(chartPlugin); // 图表

// 添加自定义容器
addCustomContainer(md, [
    {
        name: "info",
        title: "信息",
    },
    {
        name: "tip",
        title: "提示",
    },
    {
        name: "warning",
        title: "警告",
    },
    {
        name: "danger",
        title: "危险",
    },
]);

md.use(markdownitcontainer, "details", {
    render: function (tokens: MarkdownItContainerTokenType[], idx: number) {
        const m = tokens[idx]?.info.split(" ") || [];
        if (tokens[idx]?.nesting === 1) {
            return `<details class="custom-container custom-container-details"><summary class="custom-container-title">${m.length > 2 ? md.utils.escapeHtml(m[2] || "") : "详情"
                }</summary>\n`;
        } else {
            return "</details>\n";
        }
    },
});

// 禁止将电子邮件转换为链接
md.linkify.set({ fuzzyEmail: false });

// 外部链接（http/https）自动新窗口打开
md.renderer.rules.link_open = function (tokens, idx, options, _env, self) {
    const token = tokens[idx]; const href = token?.attrGet("href") ?? ""; if (/^https?:\/\//i.test(href)) {
        token?.attrSet("target", "_blank");
        token?.attrSet("rel", "noopener noreferrer");
    }
    return self.renderToken(tokens, idx, options);
};

// 定义事件
const emit = defineEmits<{
    rendered: [];
}>();

const renderedHtml = ref("");
let pendingContent: string | null = null;
let rafId: number | null = null;

// 复制图标
const copySvg = `<svg t="1747030748345" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15893" width="20" height="20" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M798.72 960H225.28a79.36 79.36 0 0 1-79.36-79.36V204.8a79.36 79.36 0 0 1 79.36-79.36h143.36a38.4 38.4 0 0 1 0 76.8H225.28a2.56 2.56 0 0 0-2.56 2.56v675.84a2.56 2.56 0 0 0 2.56 2.56h573.44a2.56 2.56 0 0 0 2.56-2.56V204.8a2.56 2.56 0 0 0-2.56-2.56h-143.36a38.4 38.4 0 0 1 0-76.8h143.36A79.36 79.36 0 0 1 878.08 204.8v675.84a79.36 79.36 0 0 1-79.36 79.36z" p-id="15894" fill="#808080"></path><path d="M368.64 64h286.72A38.4 38.4 0 0 1 693.76 102.4v122.88a38.4 38.4 0 0 1-38.4 38.4H368.64a38.4 38.4 0 0 1-38.4-38.4V102.4a38.4 38.4 0 0 1 38.4-38.4z m248.32 76.8h-209.92v46.08h209.92z" p-id="15895" fill="#808080"></path><path d="M665.6 468.48H378.88a38.4 38.4 0 1 1 0-76.8H665.6a38.4 38.4 0 0 1 0 76.8z" p-id="15896" fill="#808080"></path><path d="M665.6 632.32H378.88a38.4 38.4 0 1 1 0-76.8H665.6a38.4 38.4 0 0 1 0 76.8z" p-id="15897" fill="#808080"></path><path d="M665.6 796.16H378.88a38.4 38.4 0 1 1 0-76.8H665.6a38.4 38.4 0 0 1 0 76.8z" p-id="15898" fill="#808080"></path></svg>`;

/**
 * pre拼接
 * @param lang 语言
 * @param code 处理后的html代码串,getPre不会处理，只做拼接
 */
const getPre = (lang: string, code: string, codeHtml: string) => {
    return `<div><button class="article-content-pre-copy">${copySvg}<span style="display: none;white-space: pre-wrap;word-break: break-word;">${code}</span></button><span class="article-content-pre-lang">${lang}</span><div class="language language-${lang}">${codeHtml}</div></div>`;
}

/**
 * 渲染markdown内容
 */
function doRender(content: string) {
    md.renderAsync(content)
        .then((html) => {
            renderedHtml.value = html;
            nextTick(() => emit('rendered'));
        })
        .catch((err) => {
            console.error(err);
        })
}

/**
 * 节流渲染
 */
function scheduleRender(newContent: string) {
    pendingContent = newContent;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
        rafId = null;
        if (pendingContent !== null) {
            doRender(pendingContent);
            pendingContent = null;
        }
    });
}
watch(() => props.content, scheduleRender, { immediate: true });

/**
 * 复制代码
 */
const debounceCopyClick = debounce(async (e: PointerEvent) => {
    const btn = (e.target as Element).closest('.article-content-pre-copy');
    if (!btn) {
        return;
    }
    const code = (btn.querySelector('span')?.textContent ?? '').trimEnd();
    const ok = await copyTextToClipboard(code);
    if (ok) {
        toast.success('复制成功');
    } else {
        toast.error('复制失败');
    }
}, 2000, {
    leading: true,
    trailing: false,
});

// 允许直接跳转的域名白名单（当前站点域名始终放行）
const LINK_DOMAIN_WHITELIST = ["chat.chenjiabao.com","chenjiabao.com","doc.chenjiabao.com"];
/**
 * 判断链接域名是否在白名单内
 * @param href 链接地址
 */
const isTrustedLink = (href: string): boolean => {
    try {
        const url = new URL(href, window.location.href);
        return (
            url.host === window.location.host ||
            LINK_DOMAIN_WHITELIST.some(
                (domain) => url.host === domain || url.host.endsWith(`.${domain}`),
            )
        );
    } catch {
        return true;
    }
};
/**
 * 处理链接点击事件
 */
const handleLinkClick = (e: MouseEvent) => {
    const anchor = (e.target as Element)?.closest?.("a");
    const href = anchor?.getAttribute("href") ?? "";
    if (!/^https?:\/\//i.test(href) || isTrustedLink(href)) {
        return;
    }
    e.preventDefault();
    confirm.warning({
        title: "即将离开本站",
        message: `即将跳转到外部网站：${new URL(href).host}，是否继续访问？`,
        confirmText: "继续访问",
        cancelText: "取消",
        onConfirm: () => {
            window.open(href, "_blank", "noopener,noreferrer");
        },
    });
}

/**
 * 组件挂载时初始化
 */
onMounted(() => {
    const root = rootRef.value;
    if (root) {
        root.addEventListener('click', debounceCopyClick)
        root.addEventListener('click', handleLinkClick)
    };
})
</script>

<style>
@import "../../assets/css/index.css";
</style>