/**
 * Tavily搜索结果
 */
export interface TavilySearchResult {
    query: string;
    answer?: string | null;
    images?: {
        url: string;
        description?: string | null;
    }[] | null;
    results: {
        title?: string | null;
        url?: string | null;
        content?: string | null;
        score?: number | null;
        raw_content?: string | null;
        published_date?: string | null;
        favicon?: string | null;
        images?: {
            url: string;
            description?: string | null;
        }[] | null;
        id?: string | null;
    }[];
    response_time: number;
    auto_parameters?: {
        topic?: string | null;
        search_depth?: string | null;
    } | null;
    usage?: {
        credits?: number | null;
    } | null;
    request_id?: string | null;
    // 错误时存在，错误详情
    detail?: {
        error?: string | null;
    } | null;
}