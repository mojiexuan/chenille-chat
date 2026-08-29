import "dotenv/config";
import type { Config, EnvSchema } from "@/types";

/**
 * 集中定义所有环境变量。
 * - value 为 string：默认值，env 中未设置时使用
 * - value 为 void 0：必填项，env 中未设置则退出程序
 */
export const schema = {
  NODE_ENV: "development",
  APP_NAME: "AiChat",
  APP_PORT: "3000",
  OPENAI_API_KEY: void 0,
  OPENAI_API_BASE: void 0,
  OPENAI_API_MODEL: "gpt-5.4",
  REDIS_HOST: "127.0.0.1",
  REDIS_PORT: "6379",
  DB_HOST: "127.0.0.1",
  DB_PORT: "5432",
  DB_USER: void 0,
  DB_PASSWORD: void 0,
  DB_NAME: void 0,
  JWT_SECRET: void 0,
  JWT_EXPIRES_IN: "604800",
  // 阿里云短信配置
  ALIBABA_CLOUD_SMS_ACCESS_KEY_ID: void 0,
  ALIBABA_CLOUD_SMS_ACCESS_KEY_SECRET: void 0,
  // OSS存储配置
  ALIBABA_CLOUD_OSS_REGION: void 0,
  ALIBABA_CLOUD_OSS_ACCESS_KEY_ID: void 0,
  ALIBABA_CLOUD_OSS_ACCESS_KEY_SECRET: void 0,
  ALIBABA_CLOUD_OSS_BUCKET_NAME: void 0,
  ALIBABA_CLOUD_OSS_ENDPOINT: void 0,
  // 邮件配置
  SMTP_HOST: void 0,
  SMTP_PORT: "465",
  SMTP_USER: void 0,
  SMTP_PASS: void 0,
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
    // 从缓存中获取
    if (cache.has(prop)) {
      return cache.get(prop)!;
    }

    // 从 process.env 中获取
    const value = process.env[prop];
    // 如果 process.env 中有值，缓存并返回
    if (value !== void 0) {
      cache.set(prop, value);
      return value;
    }

    // 如果 process.env 中没有值，从 schema 中获取默认值
    const defaultValue = schema[prop as keyof typeof schema];
    if (defaultValue !== void 0) {
      cache.set(prop, defaultValue);
      return defaultValue;
    }

    // 如果 schema 中也没有默认值，退出程序
    if (prop in schema) {
      console.error(`[ENV] 缺少必需的环境变量： ${prop}`);
      process.exit(1);
    }

    return void 0;
  },
}) as unknown as Config;
