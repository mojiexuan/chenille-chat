/**
 * Vercel 服务
 */
class VercelService {

    /**
     * 注册绑定应用
     */
    async register(
        onQRCodeReady?: (url: string) => void,
        afterRegistered?: (credentials: { client_id: string; client_secret: string }) => void | Promise<void>,
        onError?: (e: unknown) => void,
    ) {
        let resolveUrl!: (url: string) => void;
        let rejectUrl!: (e: unknown) => void;

        let urlResolved = false;

        const urlReady = new Promise<string>((resolve, reject) => {
            resolveUrl = resolve;
            rejectUrl = reject;
        });

        const { registerLarkApp } = await import("@larksuite/vercel-chat-adapter");

            // 注册绑定应用
        registerLarkApp({
            onQRCodeReady: ({ url }) => {
                // 扫码成功后，返回二维码 URL
                onQRCodeReady?.(url);
                urlResolved = true;
                resolveUrl(url);
            }
        })
        .then(async (credentials) => {
            await afterRegistered?.(credentials);
        })
        .catch((e) => {
            if (!urlResolved) {
                rejectUrl(e);
            } else {
                onError?.(e);
            }
        });

        return urlReady;
    }

}

export const vercelService = new VercelService();
