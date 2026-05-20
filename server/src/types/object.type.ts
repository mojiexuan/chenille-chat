import type { z } from "zod/v4";

// 适用于任何输出具有字符串键的对象模式的类型
export type AnyObject = z.ZodType<{ [key: string]: unknown }>;
