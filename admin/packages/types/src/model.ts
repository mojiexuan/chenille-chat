interface Model {
    id: string;
    providerId: string;
}

interface ModelProvider {
    id: string;
    name: string;
    apiKey: string;
    baseUrl: string;
    isActive: boolean;
}

interface Agent {
    id: string;
    name: string;
    key: string;
    description: string;
}

export type { Agent, Model, ModelProvider }
