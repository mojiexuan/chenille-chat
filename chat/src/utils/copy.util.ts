/**
 * 复制文本到剪贴板
 * @author 陈佳宝
 * @date 2026-05-31
 */
export async function copyTextToClipboard(text: string) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // ignore
    }

    const textarea = document.createElement('textarea');

    try {
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        if (textarea.parentNode) {
            textarea.parentNode.removeChild(textarea);
        }
    }
}

/**
 * 复制图片到剪贴板
 * @author 陈佳宝
 * @date 2026-05-31
 */
export async function copyImageToClipboard(url: string) {
    try {
        if (
            !window.isSecureContext ||
            !navigator.clipboard?.write ||
            typeof ClipboardItem === "undefined"
        ) {
            return false;
        }

        const response = await fetch(url);

        if (!response.ok) {
            return false;
        }

        const blob = await response.blob();

        // 写入剪贴板
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob,
            }),
        ]);

        return true;
    } catch {
        return false;
    }
}
