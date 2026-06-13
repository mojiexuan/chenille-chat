import { get, set, del } from 'idb-keyval'

/**
 * 保存目录句柄
 */
export async function saveDirectoryHandle(
    key: string,
    handle: FileSystemDirectoryHandle
): Promise<void> {
    await set(key, handle)
}

/**
 * 删除目录句柄
 */
export async function clearDirectoryHandle(key: string): Promise<void> {
    await del(key)
}

/**
 * 获取目录句柄（不检查有效性）
 */
export async function getDirectoryHandleRaw(key: string):
    Promise<FileSystemDirectoryHandle | null> {
    const handle = await get(key)
    if (!handle) {
        return null
    }
    if (!(handle instanceof FileSystemDirectoryHandle)) {
        return null
    }
    return handle
}

/**
 * 判断目录句柄是否存在
 */
export async function hasDirectoryHandle(key: string):
    Promise<boolean> {
    const handle =
        await getDirectoryHandleRaw(key)
    return handle !== null
}

/**
 * 检查目录是否仍然存在
 */
async function checkDirectoryExists(
    handle: FileSystemDirectoryHandle
): Promise<boolean> {
    try {
        // 尝试读取一个条目
        for await (const _ of handle.values()) {
            break
        }
        return true
    } catch {
        return false
    }

}

/**
 * 检查权限状态
 */
async function getPermissionState(
    handle: FileSystemDirectoryHandle
): Promise<PermissionState> {
    try {
        return await handle.queryPermission({
            mode: 'readwrite'
        })
    } catch {

        return 'denied'

    }

}

/**
 * 请求权限
 */
async function requestPermission(
    handle: FileSystemDirectoryHandle
): Promise<boolean> {
    try {
        const result =
            await handle.requestPermission({
                mode: 'readwrite'
            })
        return result === 'granted'
    } catch {
        return false
    }
}

/**
 * 获取可用目录
 *
 * 返回 null 表示：
 * - 未保存
 * - 类型错误
 * - 目录被删除
 * - 权限被拒绝
 */
export async function getValidDirectoryHandle(key: string):
    Promise<FileSystemDirectoryHandle | null> {
    const handle =
        await getDirectoryHandleRaw(key)
    if (!handle) {
        return null
    }
    // 检查目录是否存在
    const exists =
        await checkDirectoryExists(handle)

    if (!exists) {
        await clearDirectoryHandle(key)
        return null
    }

    // 查询权限
    const permission =
        await getPermissionState(handle)
    if (permission === 'granted') {
        return handle
    }
    // 重新请求权限
    const granted =
        await requestPermission(handle)
    if (!granted) {
        return null
    }
    return handle

}

/**
 * 选择目录
 */
export async function pickDirectory():
    Promise<FileSystemDirectoryHandle> {
    if (!window.showDirectoryPicker) {
        throw new Error('当前浏览器不支持该功能')
    }
    const handle =
        await window.showDirectoryPicker({
            mode: 'readwrite'
        })
    if (handle.kind !== "directory") {
        throw new Error('选择的不是目录')
    }
    return handle
}

// /**
//  * 获取目录，没有则弹选择框
//  */
// export async function getOrPickDirectory(key: string):
//     Promise<FileSystemDirectoryHandle> {
//     const existing =
//         await getValidDirectoryHandle(key)
//     if (existing) {
//         return existing
//     }
//     return await pickDirectory(key)
// }