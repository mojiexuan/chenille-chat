import { WebSearchResult } from './search.type';

/**
 * 网络搜索
 */
export abstract class WebSearch {

    /**
     * 搜索
     */
    abstract search(query: string): Promise<WebSearchResult[]>;

}