import { monotonicFactory } from "ulid";

// 全局单调 ULID 工厂：同一毫秒内生成的 ID 按调用顺序递增
export const nextUlid = monotonicFactory();