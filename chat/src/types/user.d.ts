/**
 * 用户
 */
export interface User {
    username?: string;
    nickname?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    gender?: string;
    token?: string | null;
    usageToken?: UserUsageAiToken;
}

/**
 * 用户使用AI令牌
 */
export interface UserUsageAiToken {
    totalTokens: number;
    cachedTokens: number;
    cacheHitRate: number;
}