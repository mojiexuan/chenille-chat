import { SseEventName } from "@/enumeration";

/**
 * SSE 事件类型
 */
export type SseEventChunk<T = unknown> = {
    event: SseEventName;
    data: T;
}