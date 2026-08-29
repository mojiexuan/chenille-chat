import FingerprintJS from '@fingerprintjs/fingerprintjs';

// 初始化FingerprintJS
const fpPromise = FingerprintJS.load();

/**
 * 获取浏览器指纹
 */
export async function getFingerprint(): Promise<string> {
    const fp = await fpPromise
    const result = await fp.get()
    return result.visitorId
}