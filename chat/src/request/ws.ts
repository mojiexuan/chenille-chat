import type { WsClientOptions, WsClientStatus, WsEventHandler, WsMessageAction, WsMessage } from "@/types";
import { ref, readonly } from "vue";
import { get } from "./fetch";

/**
 * 获取 WebSocket Ticket
 */
export const getWebSocketTicker = () => {
    return get<string>("/ws/ticket");
}

/**
 * 创建 WebSocket 客户端
 */
export function createWSClient(options: WsClientOptions) {
    const status = ref<WsClientStatus>("idle");
    // 代发队列
    const queue: string[] = [];
    // 事件监听器
    const listeners = new Map<WsMessageAction, Set<WsEventHandler>>()

    // WebSocket 实例
    let ws: WebSocket | null = null;
    // 心跳定时器
    let hbTimer: ReturnType<typeof setInterval> | null = null;
    // Pong 定时器
    let pongTimer: ReturnType<typeof setTimeout> | null = null;
    // 重连定时器
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    // 重连次数
    let retry = 0;
    // 手手动关闭标记
    let manualClosed = false;

    /**
     * 触发事件
     */
    const emit = (type: WsMessageAction, data: unknown) => {
        listeners.get(type)?.forEach(fn => { try { fn(data) } catch { } })
        listeners.get('*')?.forEach(fn => { try { fn(data) } catch { } })
    }

    /**
     * 刷新队列中的消息
     */
    const flush = () => {
        while (queue.length && ws!.readyState === WebSocket.OPEN) {
            ws!.send(queue.shift()!)
        }
    }

    /**
     * 清除 Pong 定时器
     */
    const clearPongTimer = () => {
        if (pongTimer) {
            clearTimeout(pongTimer)
            pongTimer = null
        }
    }

    /**
     * 开始心跳
     */
    const startHeartbeat = () => {
        if (!options.heartbeat) {
            return
        }
        // 清除心跳定时器
        if (hbTimer) {
            clearInterval(hbTimer)
            hbTimer = null
        }
        const { interval } = options.heartbeat
        // 开始心跳定时器
        hbTimer = setInterval(() => {
            // 检查 WebSocket 是否已连接
            if (ws?.readyState !== WebSocket.OPEN) {
                return;
            }
            // 发送心跳消息
            ws.send(JSON.stringify(options.heartbeat!.data()))
            // 清除 Pong 定时器
            clearPongTimer()
            // 设置 Pong 定时器
            pongTimer = setTimeout(() => {
                ws?.close(4000, "心跳超时")
            }, interval)
        }, interval)
    }

    /**
     * 安排重连
     */
    const scheduleReconnect = () => {
        if (manualClosed) return
        const min = options.reconnect?.minDelay ?? 1000
        const max = options.reconnect?.maxDelay ?? 30000
        const delay = Math.min(min * 2 ** retry++, max)
        reconnectTimer = setTimeout(connect, delay)
    }

    /**
     * 连接 WebSocket
     */
    async function connect() {
        if (status.value === 'connecting' || (ws && ws.readyState <= WebSocket.OPEN)) {
            return
        }
        // 取消手动关闭标记
        manualClosed = false;
        // 重置状态为连接中
        status.value = 'connecting'
        // 获取连接 URL
        let url: string
        try {
            url = typeof options.url === 'function' ? await options.url() : options.url;
        } catch {
            status.value = 'closed';
            // 安排重连
            scheduleReconnect()
            return
        }
        // 创建 WebSocket 实例
        ws = new WebSocket(url)

        /**
         * 连接成功处理
         */
        ws.onopen = () => {
            // 连接成功后，重置状态
            status.value = 'open'
            // 重置重连次数
            retry = 0
            // 开始心跳
            startHeartbeat()
            // 刷新队列中的消息
            flush()
            // 触发连接成功事件
            options.onOpen?.()
        }

        /**
         * 消息处理
         */
        ws.onmessage = (e) => {
            let msg: WsMessage<unknown>
            try {
                msg = JSON.parse(e.data) as WsMessage<unknown>
            } catch {
                return
            }
            if (msg.action === 'pong') {
                clearPongTimer()
                return;
            }
            // 触发事件
            emit(msg.action, msg.data)
        }

        /**
         * 关闭处理
         */
        ws.onclose = (e) => {
            // 更新状态为已关闭
            status.value = 'closed'
            // 清除心跳定时器
            if (hbTimer) {
                clearInterval(hbTimer);
                hbTimer = null
            }
            // 清除 Pong 定时器
            clearPongTimer()
            // 如果不是手动关闭，安排重连
            if (!manualClosed && e.code !== 1000) {
                scheduleReconnect()
            }
        }

        /**
         * 错误处理
         */
        ws.onerror = () => { /* 交给 onclose 处理 */ }
    }

    /**
     * 手动关闭 WebSocket
     */
    function close() {
        manualClosed = true
        if (reconnectTimer) {
            clearTimeout(reconnectTimer)
            reconnectTimer = null
        }
        if (hbTimer) {
            clearInterval(hbTimer)
            hbTimer = null
        }
        clearPongTimer()
        queue.length = 0
        ws?.close(1000)
        ws = null
        status.value = 'closed'
    }

    /**
     * 发送消息
     */
    function send<T>(action: WsMessageAction, data: T) {
        const dataStr = JSON.stringify({ action, data } satisfies WsMessage<T>)
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(dataStr)
        } else {
            queue.push(dataStr)
        }
    }

    /**
     * 注册事件处理函数
     */
    function on<T>(action: WsMessageAction, fn: WsEventHandler<T>) {
        const handler = fn as WsEventHandler
        if (!listeners.has(action)) {
            listeners.set(action, new Set());
        }
        listeners.get(action)!.add(handler);
        return () => { listeners.get(action)!.delete(handler); }
    }

    return { status: readonly(status), connect, close, send, on }
}