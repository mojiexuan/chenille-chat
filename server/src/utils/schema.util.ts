import z, { type ZodType } from "zod/v4";

/**
 * 懒加载 Zod 模式
 * @param factory 用于创建 Zod 模式的的工厂
 * @returns 一个函数，每次调用都返回 Zod 模式的实例
 */
export function lazySchema<T extends ZodType>(factory: () => T): () => T {
  let cached: T | undefined;
  return () => (cached ??= factory());
}

/**
 * 解析 JSON 字符串
 * @param schema Zod 模式或工厂函数
 * @param json JSON 字符串
 * @returns 解析后的 Zod 模式
 */
export function parseWithSchema<T extends ZodType>(
  schema: T,
  json: string,
): z.infer<T> | null {
  try {
    const data = JSON.parse(json);
    return schema.parse(data);
  } catch (err) {
    return null;
  }
}
