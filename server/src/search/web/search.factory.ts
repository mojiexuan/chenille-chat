import { TavilySearch } from './tavily';

/**
 * 创建Web搜索
 * @returns Web搜索
 */
export function createWebSearch(provider: "tavily") {
    return new TavilySearch();
}