/**
 * API 相关类型定义
 */

/**
 * 服务端统一响应格式
 */
export interface ApiResponse<T = unknown> {
    /** 状态码 */
    code: number;
    /** 响应消息 */
    message: string;
    /** 响应数据（可选，为空时不返回） */
    data?: T;
    /** 时间戳 */
    time: string;
}

/**
 * Fetch 请求配置
 */
export interface FetchOptions<P = unknown> extends RequestInit {
    /** 请求参数（会自动处理为 URL 参数或 body）*/
    params?: P;
    /** 是否显示错误提示，默认 true */
    showErrorToast?: boolean;
    /** 是否显示成功提示，默认 false */
    showSuccessToast?: boolean;
}

/**
 * 服务端发送事件格式
 */
export interface SSEEvent<T = unknown> {
    data: T;
}