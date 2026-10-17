import { createWSClient, getWebSocketTicker } from "@/request";
import { getCurrentScope, onScopeDispose } from 'vue'
import type { WsMessageAction } from '@/types'

/**
 * WebSocket 客户端
 */
const wsClient = createWSClient({
    url: async () => {
        const ticket = await getWebSocketTicker();
        return `/ws/connect?ticket=${ticket}`
    },
    heartbeat: {
        interval: 30_000,
        data: () => {
            return {
                action: "ping"
            }
        }
    }
})

/**
 * WebSocket 客户端
 */
export function useWebSocket() {
    return wsClient
}

/**
 * WebSocket 消息处理函数
 */
export function useWsMessage<T = unknown>(action: WsMessageAction, handler: (data?: T) => void){
    const off = wsClient.on(action, handler)
    if (getCurrentScope()) {
        onScopeDispose(off)
    }
    return off
}