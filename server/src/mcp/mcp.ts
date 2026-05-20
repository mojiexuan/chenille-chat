import { MCP, McpConnection, McpConnectionStatus, McpTool } from "@/types";

class McpClient {
  private connections: Map<string, McpConnection> = new Map();

  async connect(config: MCP): Promise<McpConnection> {
    const key = config.name;
    const existing = this.connections.get(key);
    if (existing && existing.status === "connected") {
      return existing;
    }

    const connection: McpConnection = {
      config,
      status: "connecting",
      tools: [],
    };
    this.connections.set(key, connection);

    try {
      if (config.transport === "http" || config.transport === "sse") {
        const tools = await this.fetchTools(config);
        connection.tools = tools;
        connection.status = "connected";
      } else if (config.transport === "stdio") {
        connection.status = "connected";
      }
    } catch (err) {
      connection.status = "error";
      connection.error = (err as Error).message;
    }

    return connection;
  }

  async disconnect(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (connection) {
      connection.status = "disconnected";
      this.connections.delete(name);
    }
  }

  getConnection(name: string): McpConnection | undefined {
    return this.connections.get(name);
  }

  getAllConnections(): McpConnection[] {
    return Array.from(this.connections.values());
  }

  private async fetchTools(config: MCP): Promise<McpTool[]> {
    const timeout = config.timeout ?? 10_000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${config.endpoint}/tools/list`, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(config.env
            ? Object.fromEntries(
              Object.entries(config.env).map(([k, v]) => [
                `X-Env-${k}`,
                v,
              ]),
            )
            : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`MCP 服务返回错误: ${response.status}`);
      }

      const data = await response.json() as { tools?: McpTool[] };
      return data.tools ?? [];
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export { McpClient };
