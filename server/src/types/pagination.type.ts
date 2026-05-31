/**
 * 分页类型
 */
export interface Pagination<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}