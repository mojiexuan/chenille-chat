import FingerprintJS from '@fingerprintjs/fingerprintjs';

/**
 * 获取浏览器指纹
 */
export async function getFingerprintId(): Promise<string | null> {
    try {
        // 初始化FingerprintJS
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        return result.visitorId;
    } catch (error) {
        console.error('获取浏览器指纹失败:', error);
        return null;
    }
}