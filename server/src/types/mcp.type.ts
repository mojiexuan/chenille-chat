/**
 * MCP 服务
 */
export interface MCP {
  name: string;
  description: string;
  // MCP 服务的传输协议
  transport: "http" | "sse" | "stdio";
  // MCP 服务的端点
  endpoint: string;
  // 环境变量
  env?: Record<string, string>;
  // 超时时间（毫秒）
  timeout?: number;
}

/**
 * MCP 工具
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: unknown;
}

/**
 * MCP 连接状态
 */
export type McpConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

/**
 * MCP 连接
 */
export interface McpConnection {
  config: MCP;
  status: McpConnectionStatus;
  tools: McpTool[];
  error?: string;
}
