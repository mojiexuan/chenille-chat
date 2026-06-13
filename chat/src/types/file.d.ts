export type TreeEntry = FileSystemDirectoryHandle | FileSystemFileHandle

export interface FileInfo {
    name: string
    kind: 'file' | 'directory'
    size?: number
}

export interface SearchByGlobOptions {
    maxResults?: number
    ignore?: string[]
}

export interface SearchContentOptions {
    maxResults?: number
    ignore?: string[]
}

export interface ListTreeOptions {
    maxDepth?: number
}