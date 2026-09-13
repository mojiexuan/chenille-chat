import { config } from '@/config';
import { WebSearch } from '../search.base';
import type { WebSearchResult } from '../search.type';
import type { TavilySearchResult } from './tavily.search.type';
import { BizException } from '@/exception';
import { BizCode } from '@/enumeration';
import { logger } from '@/utils';

/**
 * Tavily搜索
 */
export class TavilySearch extends WebSearch {
    /**
     * 搜索
     */
    async search(query: string): Promise<WebSearchResult[]> {
        try {
            const response = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${config.WEB_SEARCH_TAVILY_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query,
                    search_depth: "advanced",
                    chunks_per_source: 3,
                    max_results: 10,
                    topic: "general",
                    include_published_date: true,
                    include_answer: false,
                    include_raw_content: "markdown",
                    include_images: false,
                    include_image_descriptions: false,
                    include_favicon: true,
                    country: "china",
                    language: "zh-cn",
                    filter_by_language: false,
                    auto_parameters: false,
                    exact_match: false,
                    include_usage: true,
                    safe_search: true,
                }),
            });
            const data = await response.json() as TavilySearchResult;
            if (data.detail?.error) {
                // 错误时返回空数组
                throw new BizException(BizCode.WEB_SEARCH_ERROR, data.detail.error || "Tavily返回了错误信息");
            }
            if (!data.results || data.results.length === 0) {
                // 没有结果时返回空数组
                return [];
            }
            return data.results.map(item => ({
                title:item.title || "",
                url:item.url || "",
                content:item.content || "",
                score:item.score || 0,
                raw_content:item.raw_content || "",
                published_date:item.published_date || "",
                favicon:item.favicon || "",
            } as WebSearchResult))
        } catch (error) {
            logger.error(error, "Tavily搜索请求失败");
            throw new BizException(BizCode.WEB_SEARCH_ERROR, "Tavily搜索请求失败");
        }
    }
}