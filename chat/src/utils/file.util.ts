import type { TreeEntry, FileInfo, SearchByGlobOptions, SearchContentOptions, ListTreeOptions } from '@/types'

const PATH_SEPARATOR = '/'

/**
 * 标准化路径
 * @param path 路径
 */
function normalizePath(path: string): string {
    return path
        .replace(/\\/g, PATH_SEPARATOR)
        .split(PATH_SEPARATOR)
        .filter(Boolean)
        .join(PATH_SEPARATOR)
}

/**
 * 分割路径为数组
 * @param path 路径
 */
function splitPath(path: string): string[] {
    return normalizePath(path).split(PATH_SEPARATOR).filter(Boolean)
}

/**
 * 获取路径的父目录路径
 * @param path 路径
 */
export function getParentPath(path: string): string {
    const segments = splitPath(path)
    segments.pop()
    return segments.join(PATH_SEPARATOR)
}

/**
 * 获取路径的文件名
 * @param path 路径
 */
export function getFileName(path: string): string {
    const segments = splitPath(path)
    return segments[segments.length - 1] ?? ''
}

/**
 * 将条目转换为 FileInfo
 * @param handle 文件/目录句柄
 */
async function toFileInfo(handle: TreeEntry): Promise<FileInfo> {
    if (handle.kind === 'file') {
        const file = await handle.getFile()
        return { name: handle.name, kind: 'file', size: file.size }
    }
    return { name: handle.name, kind: 'directory' }
}

/**
 * 将 glob 模式转换为正则
 * @param pattern glob 模式
 */
function globToRegex(pattern: string): RegExp {
    let regex = pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*\//g, '(?:.+/)?')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.')
    if (!regex.startsWith('^')) regex = '^' + regex
    if (!regex.endsWith('$')) regex = regex + '$'
    return new RegExp(regex)
}

/**
 * 检查路径是否应被忽略
 * @param path 路径
 * @param patterns 忽略模式
 */
function isIgnored(path: string, patterns?: string[]): boolean {
    if (!patterns || patterns.length === 0) return false
    return patterns.some((p) => globToRegex(p).test(path))
}

/**
 * 确保目录存在，不存在则递归创建
 * @param root 根目录句柄
 * @param path 目录路径
 */
export async function ensureDirectory(
    root: FileSystemDirectoryHandle,
    path: string,
): Promise<FileSystemDirectoryHandle> {
    const segments = splitPath(path)
    let current = root
    for (const segment of segments) {
        current = await current.getDirectoryHandle(segment, { create: true })
    }
    return current
}

/**
 * 遍历路径，定位到目标条目
 * @param root 根目录句柄
 * @param path 相对路径
 */
async function traversePath(
    root: FileSystemDirectoryHandle,
    path: string,
): Promise<{ parent: FileSystemDirectoryHandle; name: string }> {
    const segments = splitPath(path)
    if (segments.length === 0) {
        return { parent: root, name: '' }
    }

    let current = root
    for (let i = 0; i < segments.length - 1; i++) {
        current = await current.getDirectoryHandle(segments[i]!)
    }

    const name = segments[segments.length - 1]!
    return { parent: current, name }
}

/**
 * 写入文件（覆盖）
 * @param root 根目录句柄
 * @param path 文件路径
 * @param content 文本内容
 */
export async function writeFile(
    root: FileSystemDirectoryHandle,
    path: string,
    content: string,
): Promise<void> {
    const dirPath = getParentPath(path)
    const dir = await ensureDirectory(root, dirPath)
    const fileName = getFileName(path)

    const fileHandle = await dir.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
}

/**
 * 读取文本文件
 * @param root 根目录句柄
 * @param path 文件路径
 * @param encoding 编码，默认 utf-8
 */
export async function readTextFile(
    root: FileSystemDirectoryHandle,
    path: string,
    encoding?: string,
): Promise<string> {
    const { parent, name } = await traversePath(root, path)
    const fileHandle = await parent.getFileHandle(name)
    const file = await fileHandle.getFile()
    return file.text()
}

/**
 * 读取二进制文件
 * @param root 根目录句柄
 * @param path 文件路径
 */
export async function readBinaryFile(
    root: FileSystemDirectoryHandle,
    path: string,
): Promise<ArrayBuffer> {
    const { parent, name } = await traversePath(root, path)
    const fileHandle = await parent.getFileHandle(name)
    const file = await fileHandle.getFile()
    return file.arrayBuffer()
}

/**
 * 追加内容到文件末尾
 * @param root 根目录句柄
 * @param path 文件路径
 * @param content 追加内容
 */
export async function appendFile(
    root: FileSystemDirectoryHandle,
    path: string,
    content: string,
): Promise<void> {
    const dirPath = getParentPath(path)
    const dir = await ensureDirectory(root, dirPath)
    const fileName = getFileName(path)
    const fileHandle = await dir.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable({ keepExistingData: true })
    const file = await fileHandle.getFile()
    const position = file.size
    await writable.write({ type: 'write', position, data: content })
    await writable.close()
}

/**
 * 删除文件或目录
 * @param root 根目录句柄
 * @param path 路径
 * @param recursive 是否递归删除（目录时需要）
 */
export async function deleteEntry(
    root: FileSystemDirectoryHandle,
    path: string,
    recursive = false,
): Promise<void> {
    const { parent, name } = await traversePath(root, path)
    await parent.removeEntry(name, { recursive })
}

/**
 * 重命名/移动条目
 * @param root 根目录句柄
 * @param from 源路径
 * @param to 目标路径
 */
export async function moveEntry(
    root: FileSystemDirectoryHandle,
    from: string,
    to: string,
): Promise<void> {
    const src = await traversePath(root, from)
    const srcHandle = await src.parent.getFileHandle(src.name)
        .catch(() => src.parent.getDirectoryHandle(src.name))

    if (srcHandle.kind === 'file') {
        const file = await srcHandle.getFile()
        const text = await file.text()
        await writeFile(root, to, text)
        await deleteEntry(root, from)
    } else {
        const tree = await listTree(srcHandle as FileSystemDirectoryHandle)
        await ensureDirectory(root, to)
        for (const { path, info } of tree) {
            if (info.kind === 'file') {
                const content = await readTextFile(root, `${from}/${path}`)
                await writeFile(root, `${to}/${path}`, content)
            } else {
                await ensureDirectory(root, `${to}/${path}`)
            }
        }
        await deleteEntry(root, from, true)
    }
}

/**
 * 获取文件/目录信息
 * @param root 根目录句柄
 * @param path 路径
 */
export async function getInfo(
    root: FileSystemDirectoryHandle,
    path: string,
): Promise<FileInfo | null> {
    try {
        const { parent, name } = await traversePath(root, path)
        try {
            const fileHandle = await parent.getFileHandle(name)
            return toFileInfo(fileHandle)
        } catch {
            const dirHandle = await parent.getDirectoryHandle(name)
            return toFileInfo(dirHandle)
        }
    } catch {
        return null
    }
}

/**
 * 检查路径是否存在
 * @param root 根目录句柄
 * @param path 路径
 */
export async function exists(
    root: FileSystemDirectoryHandle,
    path: string,
): Promise<boolean> {
    return (await getInfo(root, path)) !== null
}

/**
 * 列出目录内容（非递归）
 * @param root 根目录句柄
 * @param path 目录路径
 */
export async function listDirectory(
    root: FileSystemDirectoryHandle,
    path?: string,
): Promise<FileInfo[]> {
    const dir = path ? await ensureDirectory(root, path) : root
    const results: FileInfo[] = []
    for await (const [, handle] of dir) {
        results.push(await toFileInfo(handle))
    }
    return results
}

/**
 * 递归列出目录树
 * @param root 根目录句柄
 * @param path 目录路径
 * @param options 选项
 */
export async function listTree(
    root: FileSystemDirectoryHandle,
    path?: string,
    options?: ListTreeOptions,
): Promise<{ path: string; info: FileInfo }[]> {
    const { maxDepth } = options ?? {}
    const results: { path: string; info: FileInfo }[] = []

    async function walk(
        dir: FileSystemDirectoryHandle,
        currentPath: string,
        depth: number,
    ) {
        if (maxDepth !== undefined && depth > maxDepth) return
        for await (const [name, handle] of dir) {
            const fullPath = currentPath ? `${currentPath}/${name}` : name
            const info = await toFileInfo(handle)
            results.push({ path: fullPath, info })
            if (handle.kind === 'directory') {
                await walk(handle, fullPath, depth + 1)
            }
        }
    }

    const dir = path ? await ensureDirectory(root, path) : root
    await walk(dir, path ?? '', 0)
    return results
}

/**
 * 按文件名 glob 模式搜索
 * @param root 根目录句柄
 * @param pattern glob 模式（如 **\/*.vue, src\/*.ts）
 * @param options 选项
 */
export async function searchByGlob(
    root: FileSystemDirectoryHandle,
    pattern: string,
    options?: SearchByGlobOptions,
): Promise<string[]> {
    const { maxResults = 200, ignore } = options ?? {}
    const regex = globToRegex(pattern)
    const results: string[] = []

    async function walk(dir: FileSystemDirectoryHandle, currentPath: string) {
        if (results.length >= maxResults) return
        for await (const [name, handle] of dir) {
            if (results.length >= maxResults) return
            const fullPath = currentPath ? `${currentPath}/${name}` : name
            if (handle.kind === 'directory') {
                if (!isIgnored(fullPath + '/', ignore)) {
                    await walk(handle, fullPath)
                }
            } else if (!isIgnored(fullPath, ignore) && regex.test(fullPath)) {
                results.push(fullPath)
            }
        }
    }

    await walk(root, '')
    return results
}

/**
 * 按文件内容搜索（grep）
 * @param root 根目录句柄
 * @param regex 搜索正则/字符串
 * @param options 选项
 */
export async function searchContent(
    root: FileSystemDirectoryHandle,
    regex: string | RegExp,
    options?: SearchContentOptions,
): Promise<{ file: string; line: number; content: string }[]> {
    const { maxResults = 100, ignore } = options ?? {}
    const pattern = typeof regex === 'string' ? new RegExp(regex, 'g') : new RegExp(regex, 'g')
    const results: { file: string; line: number; content: string }[] = []

    async function walk(dir: FileSystemDirectoryHandle, currentPath: string) {
        if (results.length >= maxResults) return
        for await (const [name, handle] of dir) {
            if (results.length >= maxResults) return
            const fullPath = currentPath ? `${currentPath}/${name}` : name
            if (handle.kind === 'directory') {
                if (!isIgnored(fullPath + '/', ignore)) {
                    await walk(handle, fullPath)
                }
            } else if (!isIgnored(fullPath, ignore)) {
                const text = await readTextFile(root, fullPath).catch(() => '')
                const lines = text.split('\n')
                for (let i = 0; i < lines.length; i++) {
                    if (results.length >= maxResults) break
                    if (pattern.test(lines[i]!)) {
                        results.push({ file: fullPath, line: i + 1, content: lines[i]!.trim() })
                    }
                }
                pattern.lastIndex = 0
            }
        }
    }
    await walk(root, '')
    return results
}