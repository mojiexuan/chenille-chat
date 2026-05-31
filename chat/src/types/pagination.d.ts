/**
 * 分页请求参数
 */
export interface PaginationRequest {
    page: number;
    pageSize: number;
}

/**
 * 分页类型
 */
export interface PaginationResponse<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}