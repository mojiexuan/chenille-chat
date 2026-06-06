/**
 * Fetch 请求封装
 * - 自动拼接 API 前缀
 * - 自动从本地缓存获取 token
 * - 统一错误处理
 * - 支持 Toast 提示
 */
import type { ApiResponse, FetchOptions, SseOptions, SseEvent } from '@/types';
import { API_BASE_URL, TOKEN_KEY, SUCCESS_CODE } from '@/config';
import { useToast } from '@/composables';
import { useUserStore } from '@/stores';
import { SseEventName } from '@/enumeration';

/**
 * 从本地存储获取 token
 */
function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * 构建完整的 URL
 */
function buildUrl(url: string): string {
    // 如果 url 已经是完整的 URL（包含 http:// 或 https://），直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // 确保 url 以 / 开头
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    // 如果 url 已经包含 API_BASE_URL，直接返回
    if (normalizedUrl.startsWith(API_BASE_URL)) {
        return normalizedUrl;
    }

    // 拼接基础 URL
    return `${API_BASE_URL}${normalizedUrl}`;
}

/**
 * 构建请求头
 */
function buildHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    // 设置默认 Content-Type
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    // 添加 token
    const token = getToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
}

/**
 * 检查 HTTP 响应状态码
 */
async function checkResponseStatus(response: Response, showErrorToast: boolean) {
    if (response.ok) {
        return;
    }
    const toast = useToast();

    let errorMessage = "服务器错误";
    try {
        const result = await response.json() as ApiResponse<void>;
        errorMessage = result.message || "服务器错误";
    } catch { }

    if (response.status === 401) {
        const userStore = useUserStore()
        // 401 错误，可能需要重新登录
        toast.error("登录过期，请重新登录");
        userStore.logout()
    }
    if (showErrorToast) {
        toast.error(errorMessage);
    }
    throw new Error(errorMessage);
}

/**
 * 处理响应
 */
async function handleResponse<T>(
    response: Response,
    showErrorToast: boolean,
    showSuccessToast: boolean,
): Promise<T> {
    const toast = useToast();
    // 检查 HTTP 状态码
    checkResponseStatus(response, showErrorToast);

    // 解析 JSON 响应
    let apiResponse: ApiResponse<T>;
    try {
        apiResponse = await response.json();
    } catch (error) {
        const parseError = '响应数据解析失败';
        if (showErrorToast) {
            toast.error(parseError);
        }
        throw new Error(parseError);
    }

    // 检查业务状态码
    if (apiResponse.code === SUCCESS_CODE) {
        // 成功时显示成功提示（如果启用）
        if (showSuccessToast && apiResponse.message) {
            toast.success(apiResponse.message);
        }
        // 返回 data 字段，如果 data 不存在则返回 void 0
        return apiResponse.data as T;
    } else {
        // 业务错误，显示错误提示
        const errorMsg = apiResponse.message || '请求失败';
        if (showErrorToast) {
            toast.error(errorMsg);
        }
        throw new Error(errorMsg);
    }
}

/**
 * 通用 fetch 请求方法
 *
 * @template T - 响应数据类型
 * @template P - 请求参数类型
 * @param url - 请求 URL（会自动拼接 API 前缀）
 * @param options - 请求配置
 * @returns 响应数据
 *
 * @example
 * ```ts
 * // GET 请求
 * const user = await request<User>('/user/123')
 *
 * // POST 请求，带参数
 * const result = await request<LoginResult, LoginParams>('/auth/login', {
 *   method: 'POST',
 *   params: { username: 'admin', password: '123456' },
 *   showSuccessToast: true, // 成功时显示提示
 * })
 *
 * // 不显示错误提示
 * const data = await request<Data>('/api/data', {
 *   showErrorToast: false,
 * })
 * ```
 */
export async function request<T = unknown, P = unknown>(
    url: string,
    options: FetchOptions<P> = {},
): Promise<T> {
    const {
        params,
        showErrorToast = true, // 默认显示错误提示
        showSuccessToast = false, // 默认不显示成功提示
        headers,
        body,
        ...restOptions
    } = options;

    // 构建完整 URL
    const fullUrl = buildUrl(url);

    // 构建请求头
    const requestHeaders = buildHeaders(headers);

    // 构建请求配置
    const requestInit: RequestInit = {
        ...restOptions,
        headers: requestHeaders,
    };

    const method = (restOptions.method || 'GET').toUpperCase();

    // 处理请求体和参数
    // 如果直接传入了 body（如 FormData），优先使用 body
    if (body) {
        requestInit.body = body;
        // FormData 需要移除 Content-Type，让浏览器自动设置
        if (body instanceof FormData) {
            requestHeaders.delete('Content-Type');
        }
    } else if (params) {
        // 否则根据 method 处理 params
        if (method === 'GET' || method === 'DELETE') {
            // GET/DELETE 请求，将参数添加到 URL
            requestHeaders.delete('Content-Type');
            const searchParams = new URLSearchParams(params as Record<string, string>);
            const separator = fullUrl.includes('?') ? '&' : '?';
            requestInit.body = void 0;
            return request<T>(`${fullUrl}${separator}${searchParams.toString()}`, {
                ...options,
                params: void 0,
            });
        } else {
            // POST/PUT/PATCH 请求，将参数放到 body
            requestInit.body = JSON.stringify(params);
        }
    } else {
        // 无 params 也无 body 的 GET/DELETE，移除 Content-Type
        if (method === 'GET' || method === 'DELETE') {
            requestHeaders.delete('Content-Type');
        }
    }

    try {
        // 发起请求
        const response = await fetch(fullUrl, requestInit);

        // 处理响应
        return await handleResponse<T>(response, showErrorToast, showSuccessToast);
    } catch (error) {
        const toast = useToast();
        // 网络错误或其他异常
        if (error instanceof Error) {
            // 如果错误已经被 handleResponse 处理过，直接抛出
            if (error.message.includes('请求失败') || error.message.includes('解析失败')) {
                throw error;
            }

            // 其他未知错误
            const errorMsg = error.message || '网络请求失败，请检查网络连接';
            if (showErrorToast) {
                toast.error(errorMsg);
            }
            throw error;
        }

        // 非 Error 类型的异常
        const unknownError = '发生未知错误';
        if (showErrorToast) {
            toast.error(unknownError);
        }
        throw new Error(unknownError);
    }
}

/**
 * GET 请求
 */
export function get<T = unknown, P = unknown>(
    url: string,
    options?: Omit<FetchOptions<P>, 'method'>,
): Promise<T> {
    return request<T, P>(url, { ...options, method: 'GET' });
}

/**
 * POST 请求
 */
export function post<T = unknown, P = unknown>(
    url: string,
    params?: P,
    options?: Omit<FetchOptions<P>, 'method' | 'params'>,
): Promise<T> {
    return request<T, P>(url, { ...options, params, method: 'POST' });
}

/**
 * PUT 请求
 */
export function put<T = unknown, P = unknown>(
    url: string,
    params?: P,
    options?: Omit<FetchOptions<P>, 'method' | 'params'>,
): Promise<T> {
    return request<T, P>(url, { ...options, params, method: 'PUT' });
}

/**
 * DELETE 请求
 */
export function del<T = unknown, P = unknown>(
    url: string,
    options?: Omit<FetchOptions<P>, 'method'>,
): Promise<T> {
    return request<T, P>(url, { ...options, method: 'DELETE' });
}

/**
 * PATCH 请求
 */
export function patch<T = unknown, P = unknown>(
    url: string,
    params?: P,
    options?: Omit<FetchOptions<P>, 'method' | 'params'>,
): Promise<T> {
    return request<T, P>(url, { ...options, params, method: 'PATCH' });
}

/**
 * SSE 流式请求方法
 */
export function sse<T = unknown, P = unknown>(url: string, options: SseOptions<T, P> = {}): AbortController {
    const {
        params,
        onMessage,
        onError,
        onComplete,
        showErrorToast = true,
        headers,
        body,
        ...restOptions
    } = options;

    const controller = new AbortController();
    const fullUrl = buildUrl(url);
    const requestHeaders = buildHeaders(headers);
    requestHeaders.set('Accept', 'text/event-stream');
    requestHeaders.delete('Content-Type');

    const requestInit: RequestInit = {
        ...restOptions,
        method: restOptions.method || 'POST',
        headers: requestHeaders,
        signal: controller.signal,
    };

    if (body) {
        requestInit.body = body;
        if (body instanceof FormData) {
            requestHeaders.delete('Content-Type');
        }
    } else if (params) {
        requestHeaders.set('Content-Type', 'application/json');
        requestInit.body = JSON.stringify(params);
    }

    const toast = useToast();

    /**
     * 分发 SSE 消息
     * @param event 事件类型
     * @param data 事件数据
     */
    const dispatchMessage = (event: string, data: string) => {
        if (!data) {
            return;
        }

        // 检查事件类型是否有效
        if (!Object.values(SseEventName).includes(event as SseEventName)) {
            return;
        }

        try {
            onMessage?.({ event, data: JSON.parse(data) } as SseEvent<T>);
        } catch {
            onMessage?.({ event, data: data as T } as SseEvent<T>);
        }
    }

    (async () => {
        try {
            const response = await fetch(fullUrl, requestInit);

            checkResponseStatus(response, showErrorToast);

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('响应流不可读');
            }

            const decoder = new TextDecoder();
            let buffer = '';
            let currentEvent = 'message';
            let currentData = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                };

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEvent = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        currentData += line.slice(5).trim();
                    } else if (line === '') {
                        dispatchMessage(currentEvent, currentData);
                        currentEvent = 'message';
                        currentData = '';
                    }
                }
            }

            if (buffer.trim()) {
                const remaining = buffer.trim();
                if (remaining.startsWith('data:')) {
                    dispatchMessage('message', remaining.slice(5).trim());
                }
            }

            onComplete?.();
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                onComplete?.();
                return;
            }
            if (error instanceof Error) {
                if (showErrorToast) {
                    toast.error('SSE 请求失败');
                }
                onError?.(error);
            } else {
                const unknownError = new Error('发生未知错误');
                if (showErrorToast) {
                    toast.error('发生未知错误');
                }
                onError?.(unknownError);
            }
        }
    })();

    return controller;
}

// 默认导出
export default {
    request,
    get,
    post,
    put,
    delete: del,
    patch,
    sse,
};