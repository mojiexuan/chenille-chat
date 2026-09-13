export interface WebSearchResultImage {
    url: string;
    description: string;
}

export interface WebSearchResult {
    title: string;
    url: string;
    content: string;
    score: number;
    raw_content: string | null;
    published_date: string | null;
    favicon: string;
    images: WebSearchResultImage[];
}