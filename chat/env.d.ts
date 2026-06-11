/// <reference types="vite/client" />

interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}

declare module 'vue-cropper' {
    export interface VueCropperInstance {
        getCropBlob(callback: (blob: Blob) => void): void
        getCropData(callback: (data: string) => void): void
        startCrop(): void
        stopCrop(): void
        clearCrop(): void
        changeScale(num: number): void
        rotateLeft(): void
        rotateRight(): void
        finish(): void
    }

    const VueCropper: VueCropperInstance
    export { VueCropper }
}

declare module "markdown-it-ins" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}

declare module "markdown-it-mark" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}

declare module "markdown-it-sub" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}

declare module "markdown-it-sup" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}

declare module "markdown-it-footnote" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}

declare module "markdown-it-deflist" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}

declare module "markdown-it-abbr" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}

declare module "markdown-it-emoji" {
    const markdownItPlugin = {
        full: MarkdownIt.PluginSimple,
    };
    export = markdownItPlugin;
}

declare module "markdown-it-container" {
    const markdownItPlugin: MarkdownIt.PluginSimple;
    export = markdownItPlugin;
}
