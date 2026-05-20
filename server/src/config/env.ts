import "dotenv/config";
import type { Config, EnvSchema } from "@/types";

/**
 * 集中定义所有环境变量。
 * - value 为 string：默认值，env 中未设置时使用
 * - value 为 undefined：必填项，env 中未设置则退出程序
 */
export const schema = {
  NODE_ENV: "development",
  APP_NAME: "Chenille Agent",
  OPENAI_API_KEY: undefined,
  OPENAI_API_BASE: undefined,
  OPENAI_API_MODEL: "gpt-5.4",
} satisfies EnvSchema;

const cache = new Map<string, string>();

/**
 * 懒加载、可缓存的环境变量配置对象。
 * 属性访问时才读取 process.env，读取后缓存。
 *
 * @example
 * import { config } from '@/config';
 * console.log(config.PORT);
 */
export const config: Config = new Proxy(schema, {
  get(_target, prop: string) {
    if (cache.has(prop)) {
      return cache.get(prop)!;
    }

    const value = process.env[prop];
    if (value !== undefined) {
      cache.set(prop, value);
      return value;
    }

    const defaultValue = schema[prop as keyof typeof schema];
    if (defaultValue !== undefined) {
      cache.set(prop, defaultValue);
      return defaultValue;
    }

    if (prop in schema) {
      console.error(`[ENV] 缺少必需的环境变量： ${prop}`);
      process.exit(1);
    }

    return undefined;
  },
}) as unknown as Config;
