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
    settings?: UserSettings;
    agentProfile?: UserAgentProfile;
}

/**
 * 用户使用AI令牌
 */
export interface UserUsageAiToken {
    totalTokens: number;
    cachedTokens: number;
    cacheHitRate: number;
}

/**
 * 用户设置
 */
export interface UserSettings {
    isLocationEnabled: boolean;
}

/**
 * 用户助手配置
 */
export interface UserAgentProfile {
    agentNickname?: string;
    userAlias?: string;
    personaPrompt?: string;
}
